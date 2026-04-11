import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  arrayRemove,
  arrayUnion,
  deleteDoc,
  doc,
  runTransaction,
} from "firebase/firestore";
import toast from "react-hot-toast";
import { db } from "../../firebase";
import { useAuthStore } from "../../store/useAuthStore";
import Avatar from "../common/Avatar";
import Badge from "../common/Badge";
import {
  STATUS_LABEL,
  formatMeetingTime,
  getPartyStatus,
  isMember,
} from "../../utils/partyHelpers";

const STATUS_VARIANT = {
  open: "green",
  full: "red",
  closed: "gray",
};

const PartyDetail = ({ party }) => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);

  const status = getPartyStatus(party);
  const joined = isMember(party, user?.uid);
  const isHost = user?.uid === party.hostUid;
  const currentCount = party.currentMembers?.length ?? 0;
  const emptySlots = Math.max(0, party.maxMembers - currentCount);
  const canJoin = status === "open" && !joined;

  const handleJoin = async () => {
    if (!user || pending) return;
    try {
      setPending(true);
      const ref = doc(db, "parties", party.id);
      await runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(ref);
        if (!snapshot.exists()) throw new Error("파티가 존재하지 않아요");
        const data = snapshot.data();
        const members = data.currentMembers ?? [];
        if (members.some((m) => m.uid === user.uid)) {
          throw new Error("이미 참여한 파티예요");
        }
        if (members.length >= data.maxMembers) {
          throw new Error("정원이 가득 찼어요");
        }
        const me = {
          uid: user.uid,
          displayName: user.displayName ?? "익명",
          photoURL: user.photoURL ?? "",
        };
        const nextLength = members.length + 1;
        transaction.update(ref, {
          currentMembers: arrayUnion(me),
          status: nextLength >= data.maxMembers ? "full" : "open",
        });
      });
      toast.success("파티에 참여했어요!");
    } catch (error) {
      console.error(error);
      toast.error(error.message ?? "참여에 실패했어요");
    } finally {
      setPending(false);
    }
  };

  const handleLeave = async () => {
    if (!user || pending) return;
    try {
      setPending(true);
      const ref = doc(db, "parties", party.id);
      await runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(ref);
        if (!snapshot.exists()) throw new Error("파티가 존재하지 않아요");
        const data = snapshot.data();
        const me = (data.currentMembers ?? []).find((m) => m.uid === user.uid);
        if (!me) throw new Error("참여 정보가 없어요");
        transaction.update(ref, {
          currentMembers: arrayRemove(me),
          status: "open",
        });
      });
      toast.success("참여를 취소했어요");
    } catch (error) {
      console.error(error);
      toast.error(error.message ?? "참여 취소에 실패했어요");
    } finally {
      setPending(false);
    }
  };

  const handleDelete = async () => {
    if (!isHost || pending) return;
    const confirmed = window.confirm("정말 이 파티를 삭제할까요?");
    if (!confirmed) return;
    try {
      setPending(true);
      await deleteDoc(doc(db, "parties", party.id));
      toast.success("파티가 삭제되었어요");
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error("파티 삭제에 실패했어요");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={() => navigate("/")}
        className="text-sm text-gray-500 hover:text-gray-800"
      >
        ← 목록으로
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-gray-900 truncate">
                {party.restaurantName}
              </span>
              <Badge variant="brand">{party.restaurantCategory}</Badge>
            </div>
            <h1 className="text-xl font-bold text-gray-900">{party.title}</h1>
          </div>
          <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700 mb-4">
          <div className="flex items-center gap-2">
            <dt className="text-gray-500">🕛 만남 시각</dt>
            <dd>{formatMeetingTime(party.meetingTime)}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="text-gray-500">📍 위치</dt>
            <dd className="truncate">{party.location}</dd>
          </div>
        </dl>

        {party.description && (
          <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-3 border border-gray-100">
            {party.description}
          </p>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">파티원</h2>
          <span className="text-sm text-gray-500">
            {currentCount}/{party.maxMembers}명
          </span>
        </div>

        <ul className="flex flex-wrap gap-4">
          {(party.currentMembers ?? []).map((member) => (
            <li key={member.uid} className="flex flex-col items-center gap-1 w-16">
              <div className="relative">
                <Avatar name={member.displayName} src={member.photoURL} />
                {member.uid === party.hostUid && (
                  <span className="absolute -top-1 -right-1 text-sm">👑</span>
                )}
              </div>
              <span className="text-xs text-gray-700 truncate max-w-full">
                {member.displayName}
              </span>
            </li>
          ))}
          {Array.from({ length: emptySlots }).map((_, index) => (
            <li
              key={`empty-${index}`}
              className="flex flex-col items-center gap-1 w-16"
            >
              <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300" />
              <span className="text-xs text-gray-400">빈 자리</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center gap-2">
        {isHost ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="flex-1 py-3 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-60 transition"
          >
            파티 삭제
          </button>
        ) : joined ? (
          <button
            type="button"
            onClick={handleLeave}
            disabled={pending}
            className="flex-1 py-3 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-60 transition"
          >
            참여 취소
          </button>
        ) : (
          <button
            type="button"
            onClick={handleJoin}
            disabled={!canJoin || pending}
            className="flex-1 py-3 rounded-xl text-sm font-semibold bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            {status === "open" ? "참여하기" : STATUS_LABEL[status]}
          </button>
        )}
      </div>
    </div>
  );
};

export default PartyDetail;

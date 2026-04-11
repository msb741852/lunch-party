import { useEffect, useRef, useState } from "react";
import {
  Timestamp,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import toast from "react-hot-toast";
import { db } from "../../firebase";
import { useAuthStore } from "../../store/useAuthStore";
import {
  CATEGORY_OPTIONS,
  buildMeetingDateFromTimeString,
} from "../../utils/partyHelpers";

const initialForm = {
  title: "",
  restaurantName: "",
  restaurantCategory: CATEGORY_OPTIONS[0],
  location: "",
  meetingTime: "12:00",
  maxMembers: 4,
  description: "",
};

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const PartyForm = ({ onClose }) => {
  const user = useAuthStore((state) => state.user);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const dialogRef = useRef(null);
  const firstFieldRef = useRef(null);

  // body 스크롤 잠금 + 최초 포커스
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstFieldRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // ESC 닫기 + Tab 순환 focus trap
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose?.();
        return;
      }
      if (event.key !== "Tab") return;
      const container = dialogRef.current;
      if (!container) return;
      const focusable = container.querySelectorAll(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !container.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) onClose?.();
  };

  const update = (field) => (event) => {
    const value =
      field === "maxMembers" ? Number(event.target.value) : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    if (!form.title.trim()) return "파티 제목을 입력해주세요";
    if (form.title.length > 40) return "파티 제목은 40자 이내로 입력해주세요";
    if (!form.restaurantName.trim()) return "식당 이름을 입력해주세요";
    if (!form.location.trim()) return "위치를 입력해주세요";
    if (form.description.length > 200)
      return "파티 설명은 200자 이내로 입력해주세요";
    if (form.maxMembers < 2 || form.maxMembers > 8)
      return "최대 인원은 2~8명 사이로 설정해주세요";
    const meetingDate = buildMeetingDateFromTimeString(form.meetingTime);
    if (!meetingDate) return "만남 시각을 입력해주세요";
    if (meetingDate.getTime() <= Date.now())
      return "만남 시각은 현재 시각 이후여야 해요";
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user) return;

    const errorMessage = validate();
    if (errorMessage) {
      toast.error(errorMessage);
      return;
    }

    try {
      setSubmitting(true);
      const meetingDate = buildMeetingDateFromTimeString(form.meetingTime);
      await addDoc(collection(db, "parties"), {
        title: form.title.trim(),
        restaurantName: form.restaurantName.trim(),
        restaurantCategory: form.restaurantCategory,
        location: form.location.trim(),
        description: form.description.trim(),
        meetingTime: Timestamp.fromDate(meetingDate),
        maxMembers: form.maxMembers,
        currentMembers: [
          {
            uid: user.uid,
            displayName: user.displayName ?? "익명",
            photoURL: user.photoURL ?? "",
          },
        ],
        hostUid: user.uid,
        hostName: user.displayName ?? "익명",
        status: "open",
        createdAt: serverTimestamp(),
      });
      toast.success("파티가 생성되었어요!");
      onClose?.();
    } catch (error) {
      console.error(error);
      toast.error("파티 생성에 실패했어요");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="party-form-title"
        className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h2
            id="party-form-title"
            className="text-lg font-semibold text-gray-900"
          >
            새 파티 만들기
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              파티 제목
            </label>
            <input
              ref={firstFieldRef}
              type="text"
              value={form.title}
              onChange={update("title")}
              maxLength={40}
              placeholder="예: 오늘 혼밥탈출! 김치찌개 같이 가요"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                식당 이름
              </label>
              <input
                type="text"
                value={form.restaurantName}
                onChange={update("restaurantName")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                카테고리
              </label>
              <select
                value={form.restaurantCategory}
                onChange={update("restaurantCategory")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              위치
            </label>
            <input
              type="text"
              value={form.location}
              onChange={update("location")}
              placeholder="예: 본관 1층 / 사거리 편의점 앞"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                만남 시각
              </label>
              <input
                type="time"
                value={form.meetingTime}
                onChange={update("meetingTime")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                최대 인원
              </label>
              <input
                type="number"
                min={2}
                max={8}
                value={form.maxMembers}
                onChange={update("maxMembers")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              파티 설명 (선택)
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={update("description")}
              maxLength={200}
              placeholder="분위기, 예산, 주의사항 등을 자유롭게 적어주세요"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
            <p className="mt-1 text-xs text-gray-400 text-right">
              {form.description.length}/200
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {submitting ? "만드는 중..." : "파티 만들기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PartyForm;

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import toast from "react-hot-toast";
import { db } from "../firebase";
import { getTodayRange } from "../utils/partyHelpers";

export const useParties = () => {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { start, end } = getTodayRange();
    const q = query(
      collection(db, "parties"),
      where("meetingTime", ">=", Timestamp.fromDate(start)),
      where("meetingTime", "<=", Timestamp.fromDate(end)),
      orderBy("meetingTime", "asc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const next = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setParties(next);
        setLoading(false);
      },
      (error) => {
        console.error("useParties error", error);
        toast.error("파티 목록을 불러오지 못했어요");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return { parties, loading };
};

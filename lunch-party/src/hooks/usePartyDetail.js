import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import toast from "react-hot-toast";
import { db } from "../firebase";

const initialState = (partyId) => ({
  partyId,
  party: null,
  loading: true,
  notFound: false,
});

export const usePartyDetail = (partyId) => {
  const [state, setState] = useState(() => initialState(partyId));

  // Reset state when partyId changes — the React-recommended pattern for
  // synchronizing derived state with a changed prop/arg.
  if (state.partyId !== partyId) {
    setState(initialState(partyId));
  }

  useEffect(() => {
    if (!partyId) return undefined;

    const ref = doc(db, "parties", partyId);
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        if (!snapshot.exists()) {
          setState({ partyId, party: null, loading: false, notFound: true });
        } else {
          setState({
            partyId,
            party: { id: snapshot.id, ...snapshot.data() },
            loading: false,
            notFound: false,
          });
        }
      },
      (error) => {
        console.error("usePartyDetail error", error);
        toast.error("파티 정보를 불러오지 못했어요");
        setState((prev) => ({ ...prev, loading: false }));
      },
    );

    return () => unsubscribe();
  }, [partyId]);

  return {
    party: state.party,
    loading: state.loading,
    notFound: state.notFound,
  };
};

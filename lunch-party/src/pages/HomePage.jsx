import { useMemo, useState } from "react";
import Navbar from "../components/layout/Navbar";
import PartyCard from "../components/party/PartyCard";
import PartyForm from "../components/party/PartyForm";
import { useParties } from "../hooks/useParties";
import { CATEGORY_OPTIONS, getPartyStatus } from "../utils/partyHelpers";

const STATUS_FILTERS = [
  { value: "all", label: "전체" },
  { value: "open", label: "모집중" },
  { value: "full", label: "마감" },
];

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
    <div className="flex items-center justify-between mb-3">
      <div className="h-4 w-24 bg-gray-200 rounded" />
      <div className="h-4 w-12 bg-gray-200 rounded-full" />
    </div>
    <div className="h-5 w-3/4 bg-gray-200 rounded mb-3" />
    <div className="h-4 w-full bg-gray-100 rounded mb-3" />
    <div className="h-1.5 w-full bg-gray-100 rounded-full mb-3" />
    <div className="h-3 w-20 bg-gray-100 rounded" />
  </div>
);

const HomePage = () => {
  const { parties, loading } = useParties();
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() => {
    return parties.filter((party) => {
      const status = getPartyStatus(party);
      if (statusFilter === "open" && status !== "open") return false;
      if (statusFilter === "full" && status === "open") return false;
      if (
        categoryFilter !== "all" &&
        party.restaurantCategory !== categoryFilter
      ) {
        return false;
      }
      return true;
    });
  }, [parties, statusFilter, categoryFilter]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">오늘의 점심 파티</h1>
            <p className="text-sm text-gray-500">
              마음에 드는 파티에 참여하거나 직접 만들어보세요
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition"
          >
            + 파티 만들기
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="inline-flex bg-white rounded-full border border-gray-200 p-1">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatusFilter(filter.value)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition ${
                  statusFilter === filter.value
                    ? "bg-brand-500 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="text-base bg-white border border-gray-200 rounded-full px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">전체 카테고리</option>
            {CATEGORY_OPTIONS.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-16 text-center">
            <div className="text-4xl mb-3">🍽️</div>
            <p className="text-gray-600 font-medium">
              오늘 등록된 파티가 없어요
            </p>
            <p className="text-sm text-gray-400 mt-1">
              첫 번째 파티를 만들어볼까요?
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((party) => (
              <PartyCard key={party.id} party={party} />
            ))}
          </div>
        )}
      </main>

      {showForm && <PartyForm onClose={() => setShowForm(false)} />}
    </div>
  );
};

export default HomePage;

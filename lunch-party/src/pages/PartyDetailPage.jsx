import { useParams } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import PartyDetail from "../components/party/PartyDetail";
import { usePartyDetail } from "../hooks/usePartyDetail";

const LoadingSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-4 w-20 bg-gray-200 rounded" />
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
      <div className="h-5 w-1/3 bg-gray-200 rounded" />
      <div className="h-6 w-2/3 bg-gray-200 rounded" />
      <div className="h-4 w-full bg-gray-100 rounded" />
      <div className="h-4 w-5/6 bg-gray-100 rounded" />
    </div>
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
      <div className="h-5 w-24 bg-gray-200 rounded" />
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200" />
        <div className="w-10 h-10 rounded-full bg-gray-200" />
        <div className="w-10 h-10 rounded-full bg-gray-200" />
      </div>
    </div>
  </div>
);

const PartyDetailPage = () => {
  const { id } = useParams();
  const { party, loading, notFound } = usePartyDetail(id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <LoadingSkeleton />
        ) : notFound || !party ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-16 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-600 font-medium">
              파티를 찾을 수 없어요
            </p>
            <p className="text-sm text-gray-400 mt-1">
              이미 삭제되었거나 만료된 파티예요
            </p>
          </div>
        ) : (
          <PartyDetail party={party} />
        )}
      </main>
    </div>
  );
};

export default PartyDetailPage;

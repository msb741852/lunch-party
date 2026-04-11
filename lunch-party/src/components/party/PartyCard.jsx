import { Link } from "react-router-dom";
import Badge from "../common/Badge";
import {
  STATUS_LABEL,
  formatMeetingTime,
  getPartyStatus,
} from "../../utils/partyHelpers";

const STATUS_VARIANT = {
  open: "green",
  full: "red",
  closed: "gray",
};

const PartyCard = ({ party }) => {
  const status = getPartyStatus(party);
  const currentCount = party.currentMembers?.length ?? 0;
  const progress = Math.min(
    100,
    Math.round((currentCount / Math.max(1, party.maxMembers)) * 100),
  );

  return (
    <Link
      to={`/party/${party.id}`}
      className="block bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600 min-w-0">
          <span className="font-medium text-gray-900 truncate">
            {party.restaurantName}
          </span>
          <Badge variant="brand">{party.restaurantCategory}</Badge>
        </div>
        <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
      </div>

      <h3 className="text-base font-semibold text-gray-900 line-clamp-2 mb-3">
        {party.title}
      </h3>

      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
        <span className="inline-flex items-center gap-1">
          <span>🕛</span>
          <span>{formatMeetingTime(party.meetingTime)}</span>
        </span>
        <span className="text-gray-500">
          {currentCount}/{party.maxMembers}명
        </span>
      </div>

      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-brand-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="text-xs text-gray-500">호스트 · {party.hostName}</div>
    </Link>
  );
};

export default PartyCard;

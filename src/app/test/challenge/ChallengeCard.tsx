import { ChallengeTest } from "@/lib/apis/tests";
import Link from "next/link";
import {
  FaCheckCircle,
  FaPlay,
  FaSpinner,
  FaUserFriends,
  FaClock,
  FaCalendarAlt,
  FaQuestionCircle,
  FaExclamationTriangle,
  FaHourglassEnd,
  FaTrophy,
  FaTimesCircle,
  FaTimes,
  FaUser,
  FaHourglassHalf,
  FaMedal
} from "react-icons/fa";
import { format, formatDistanceToNow } from "date-fns";
import { useEffect, useState, Fragment } from "react";
import { getServerTime } from "@/lib/helpers/test-helpers";
import { calculateChallengeStats } from "@/lib/helpers/challenge-helpers";
import { bloxat } from "@/components/fonts";
import { InfoCard } from "@/components/shared/data/InfoCard";
import { Button } from "@/components/shared/ui/Button";

export function ChallengeCard({
  challenge,
  userId,
  accepting,
  onAccept,
}: {
  challenge: ChallengeTest;
  userId: string | null;
  accepting: boolean;
  onAccept: (id: string) => Promise<void>;
}) {
  const isCreator = challenge.createdBy === userId;
  const friendName = isCreator ? challenge.invitedName : challenge.createdByName;
  const startTime = challenge.startTime;
  const endTime = new Date(startTime.getTime() + challenge.time * 1000);
  const results = challenge.results;
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notStarted, setNotStarted] = useState(currentTime < startTime);
  const isOver = currentTime > endTime;
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    getServerTime().then(serverTime => {
      setCurrentTime(serverTime);
      setNotStarted(serverTime < startTime);
    });

    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      setNotStarted(now < startTime);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [startTime]);

  const getStatusBadge = () => {
    if (challenge.status === "pending") {
      if (isOver) {
        return {
          variant: 'error' as const,
          icon: <FaExclamationTriangle />,
          label: "Expired"
        };
      }
      return {
        variant: 'warning' as const,
        icon: <FaSpinner className="animate-spin" />,
        label: "Pending"
      };
    } else if (challenge.status === "accepted") {
      return {
        variant: 'success' as const,
        icon: <FaPlay />,
        label: "Accepted"
      };
    } else if (challenge.status === "completed") {
      const creatorResult = challenge.results?.[challenge.createdBy];
      const invitedResult = challenge.results?.[challenge.invitedUser];
      
      if (creatorResult && invitedResult) {
        const creatorScore = creatorResult.totalCorrect;
        const invitedScore = invitedResult.totalCorrect;
        
        if (creatorScore > invitedScore && challenge.createdBy === userId) {
          return {
            variant: 'success' as const,
            icon: <FaTrophy className="animate-bounce" />,
            label: "You Won!"
          };
        } else if (invitedScore > creatorScore && challenge.invitedUser === userId) {
          return {
            variant: 'success' as const,
            icon: <FaTrophy className="animate-bounce" />,
            label: "You Won!"
          };
        } else if (creatorScore === invitedScore) {
          return {
            variant: 'info' as const,
            icon: <FaMedal />,
            label: "Tie!"
          };
        }
      }
      return {
        variant: 'default' as const,
        icon: <FaCheckCircle />,
        label: "Completed"
      };
    }
    return {
      variant: 'error' as const,
      icon: <FaTimesCircle />,
      label: "Rejected"
    };
  };

  const getActionButton = () => {
    if (challenge.status === "pending") {
      if (isOver && !results) {
        return undefined; // Will be handled by InfoCard status
      } else if (isCreator) {
        return undefined; // Will be handled by InfoCard status
      } else if (accepting) {
        return undefined; // Will be handled by InfoCard status
      } else {
        return {
          primary: {
            label: "Accept Challenge",
            onClick: () => onAccept(challenge.id),
            loading: accepting
          }
        };
      }
    } else if (challenge.status === "accepted") {
      if (isOver) {
        return undefined; // Will be handled by InfoCard status
      } else if (notStarted) {
        return {
          primary: {
            label: "View Details",
            onClick: () => setShowDetailsModal(true)
          }
        };
      } else {
        return {
          primary: {
            label: "Start Challenge",
            onClick: () => window.location.href += `/${challenge.id}`
          }
        };
      }
    } else if (challenge.status === "completed") {
      return {
        primary: {
          label: "View Results",
          onClick: () => window.location.href = `/test/challenge/result/${challenge.id}`
        }
      };
    }
    
    return undefined;
  };

  const statusBadge = getStatusBadge();
  const actionButtons = getActionButton();

  const challengeContent = (
    <div className="space-y-4">
      {/* User info */}
      <div className="flex items-center gap-3 p-3 bg-tathir-beige/50 rounded-lg border border-tathir-brown/20">
        <div className="w-10 h-10 rounded-lg bg-tathir-cream flex items-center justify-center border-2 border-tathir-brown">
          <FaUserFriends className="text-xl text-tathir-dark-green" />
        </div>
        <div>
          <span className={`font-bold text-tathir-dark-green text-xl ${bloxat.className}`}>{friendName}</span>
          <span className="block text-sm text-tathir-brown">
            {isCreator ? "You challenged them" : "Challenged you"}
          </span>
        </div>
      </div>

      {/* Challenge details */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-tathir-cream rounded-lg flex items-center gap-2 border border-tathir-brown/20">
          <FaQuestionCircle className="text-tathir-brown" />
          <span className="text-sm text-tathir-brown font-medium">{challenge.orderedQuestions.length} Questions</span>
        </div>
        <div className="p-3 bg-tathir-cream rounded-lg flex items-center gap-2 border border-tathir-brown/20">
          <FaClock className="text-tathir-brown" />
          <span className="text-sm text-tathir-brown font-medium">{Math.ceil(challenge.time / 60)} Minutes</span>
        </div>
        <div className="p-3 bg-tathir-cream rounded-lg flex items-center col-span-2 border border-tathir-brown/20">
          <FaCalendarAlt className="text-tathir-brown mr-2" />
          <div>
            <span className={`text-sm font-bold text-tathir-brown ${bloxat.className}`}>
              {format(startTime, "MMM d, h:mm a")}
            </span>
            {notStarted && (
              <span className="block text-xs text-tathir-dark-green font-medium">
                Starts in {formatDistanceToNow(startTime, { addSuffix: false })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Status display for special states */}
      {challenge.status === "pending" && isCreator && (
        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-center gap-2">
          <FaSpinner className="text-amber-600 animate-spin" />
          <span className="text-sm text-amber-700 font-medium">Waiting for response</span>
        </div>
      )}

      {challenge.status === "pending" && accepting && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-center gap-2">
          <FaSpinner className="text-blue-600 animate-spin" />
          <span className="text-sm text-blue-700 font-medium">Accepting...</span>
        </div>
      )}

      {challenge.status === "pending" && isOver && !results && (
        <div className="p-3 bg-red-50 rounded-lg border border-red-200 flex items-center gap-2">
          <FaHourglassEnd className="text-red-600" />
          <span className="text-sm text-red-700 font-medium">Challenge expired</span>
        </div>
      )}

      {challenge.status === "accepted" && notStarted && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-center gap-2">
          <FaSpinner className="text-blue-600 animate-spin" />
          <span className="text-sm text-blue-700 font-medium">
            Starts in {formatDistanceToNow(startTime, { addSuffix: false })}
          </span>
        </div>
      )}

      {challenge.status === "completed" && (
        <>
          {(() => {
            const stats = calculateChallengeStats(challenge);
            
            if (stats.hasAllResults) {
              const isCreator = userId === challenge.createdBy;
              const userScore = isCreator ? stats.creatorStats?.score : stats.invitedStats?.score;
              const userTotal = isCreator ? stats.creatorStats?.total : stats.invitedStats?.total;
              const opponentScore = isCreator ? stats.invitedStats?.score : stats.creatorStats?.score;
              const opponentTotal = isCreator ? stats.invitedStats?.total : stats.creatorStats?.total;
              
              const isWinner = stats.winner === userId;
              
              return (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 bg-tathir-dark-green/10 rounded-lg p-4 border border-tathir-dark-green/20">
                    <div>
                      <span className="text-tathir-brown text-sm block mb-1">Your score</span>
                      <span className={`text-xl font-bold ${isWinner ? 'text-tathir-dark-green' : 'text-tathir-brown'} ${bloxat.className}`}>
                        {userScore}/{userTotal}
                      </span>
                    </div>
                    <div>
                      <span className="text-tathir-brown text-sm block mb-1">Opponent</span>
                      <span className={`text-xl font-bold ${stats.winner && !isWinner ? 'text-tathir-dark-green' : 'text-tathir-brown'} ${bloxat.className}`}>
                        {opponentScore}/{opponentTotal}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })()}
        </>
      )}
    </div>
  );

  return (
    <Fragment>
      <InfoCard
        title={`Challenge vs ${friendName}`}
        variant="student"
        className="max-w-md mx-auto"
        icon={statusBadge.icon}
        content={challengeContent}
        actions={actionButtons}
      />

      {/* Modal for details */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg relative animate-fadeIn bg-tathir-dark-green rounded-xl p-6 border-2 border-tathir-cream">
            <button
              onClick={() => setShowDetailsModal(false)}
              className="absolute top-4 right-4 text-tathir-cream hover:text-tathir-light-green p-2"
            >
              <FaTimes className="text-xl" />
            </button>

            <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 text-tathir-cream border-b-2 border-tathir-maroon pb-4 ${bloxat.className}`}>
              <FaCalendarAlt /> Challenge Details
            </h2>

            <div className="space-y-4">
              <div className="bg-tathir-cream/10 p-3 rounded-lg flex items-center gap-3 border border-tathir-cream/20">
                <FaUser className="text-tathir-cream" />
                <div>
                  <span className="text-sm text-tathir-cream/90">Challenger</span>
                  <p className="font-bold text-tathir-cream">{challenge.createdByName}</p>
                </div>
              </div>

              <div className="bg-tathir-cream/10 p-3 rounded-lg flex items-center gap-3 border border-tathir-cream/20">
                <FaUserFriends className="text-tathir-cream" />
                <div>
                  <span className="text-sm text-tathir-cream/90">Invited</span>
                  <p className="font-bold text-tathir-cream">{challenge.invitedName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-tathir-cream/10 p-3 rounded-lg border border-tathir-cream/20">
                  <span className="text-sm text-tathir-cream/90 block">Start Time</span>
                  <p className="font-bold flex items-center gap-2 text-tathir-cream">
                    <FaClock />
                    {format(startTime, "MMM d, yyyy h:mm a")}
                  </p>
                </div>

                <div className="bg-tathir-cream/10 p-3 rounded-lg border border-tathir-cream/20">
                  <span className="text-sm text-tathir-cream/90 block">Duration</span>
                  <p className="font-bold flex items-center gap-2 text-tathir-cream">
                    <FaHourglassHalf />
                    {Math.ceil(challenge.time / 60)} minutes
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-tathir-cream/10 p-3 rounded-lg border border-tathir-cream/20">
                  <span className="text-sm text-tathir-cream/90 block">Questions</span>
                  <p className="font-bold flex items-center gap-2 text-tathir-cream">
                    <FaQuestionCircle />
                    {challenge.orderedQuestions.length}
                  </p>
                </div>

                <div className="bg-tathir-cream/10 p-3 rounded-lg border border-tathir-cream/20 flex items-center gap-2">
                  {statusBadge.icon}
                  <span className="text-sm text-tathir-cream font-medium">{statusBadge.label}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
}

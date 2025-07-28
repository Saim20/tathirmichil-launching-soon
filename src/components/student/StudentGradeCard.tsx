import { UserProfile } from "@/lib/apis/users";

interface StudentGradeCardProps {
  user: UserProfile;
}

export default function StudentGradeCard({ user }: StudentGradeCardProps) {
  return (
    <div className="bg-tathir-cream rounded-xl shadow-lg p-6 border-2 border-tathir-brown flex flex-col items-center">
      <h2 className="text-lg font-bold text-tathir-dark-green mb-2">Your Grade</h2>
      {user.grade ? (
        <>
          <div className="text-4xl font-extrabold text-tathir-maroon mb-1">{user.grade}</div>
          <div className="text-xs text-tathir-brown">
            Last updated: {user.gradeUpdatedAt ? user.gradeUpdatedAt.toLocaleString() : 'Unknown'}
          </div>
        </>
      ) : (
        <div className="text-tathir-brown">No grade assigned yet.</div>
      )}
    </div>
  );
}

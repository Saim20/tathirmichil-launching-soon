import { LiveTest, AssessmentTest, OrderedQuestion } from "@/lib/apis/tests";

interface AdminTestCardProps<T extends { id: string; orderedQuestions: OrderedQuestion[]; time: number; createdAt: Date }> {
  test: T;
  type: string;
  onEvaluate: (testId: string) => void;
  evaluating: boolean;
}

export default function AdminTestCard<T extends { id: string; orderedQuestions: OrderedQuestion[]; time: number; createdAt: Date; startsAt?: Date; endsAt?: Date }>({
  test,
  onEvaluate,
  evaluating,
  type,
}: AdminTestCardProps<T>) {
  return (
    <div className="card w-full bg-tathir-maroon hover:scale-105 transition-all ease-in-out duration-300 cursor-default shadow-2xl text-tathir-beige">
      <div className="card-body">
        <span className="badge badge-sm text-tathir-maroon border-none bg-warning">
          Not Evaluated
        </span>
        <div className="flex flex-col justify-between">
          <h2 className="text-3xl uppercase font-bold">{type} Test</h2>
          <span className="text-sm text-white">{Number(test.time / 60).toFixed(0)} minutes</span>
          {test.time % 60 !== 0 && <span className="text-sm text-white">{test.time % 60} seconds</span>}
        </div>
        <ul className="mt-6 flex flex-col gap-2 text-s">
          <li>
            <span>Test ID: {test.id}</span>
          </li>
          <li>
            <span>Questions: {test.orderedQuestions.length}</span>
          </li>
          {test.startsAt && (
            <li>
              <span>Starts At: {test.startsAt.toLocaleString("en-GB")}</span>
            </li>
          )}
          {test.endsAt && (
            <li>
              <span>Ends At: {test.endsAt.toLocaleString("en-GB")}</span>
            </li>
          )}
          <li>
            <span>Created At: {test.createdAt.toLocaleDateString("en-GB")}</span>
          </li>
        </ul>
        <div className="mt-1">
          <button
            onClick={() => onEvaluate(test.id)}
            disabled={evaluating}
            className="border-none cursor-pointer rounded-md py-3 bg-tathir-dark-green text-white uppercase btn-block disabled:bg-gray-600"
          >
            {evaluating ? "Evaluating..." : "Evaluate Test"}
          </button>
        </div>
      </div>
    </div>
  );
}

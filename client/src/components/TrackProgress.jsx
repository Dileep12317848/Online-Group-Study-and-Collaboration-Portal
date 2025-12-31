import React, { useEffect, useState } from "react";
import { getProgressSummary } from "../services/api";

const TrackProgress = () => {
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
  const fetchProgress = async () => {
    try {
      const res = await getProgressSummary();

      // VERY IMPORTANT safety check
      if (res && res.data) {
        setProgress(res.data);
      } else {
        setProgress({});
      }
    } catch (err) {
      console.error("Progress API Error:", err);
      setError("Unable to load progress data");
    }
  };

  fetchProgress();
}, []);



  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        {error}
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading your progress...
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-xl bg-white p-6 shadow">
      <h2 className="mb-6 text-2xl font-semibold">📊 Your Activity Progress</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-blue-100 p-4 text-center">
          <p className="text-sm text-gray-600">Resources Shared</p>
          <p className="mt-2 text-3xl font-bold text-blue-700">
            {progress.resourcesShared ?? 0}
          </p>
        </div>

        <div className="rounded-lg bg-green-100 p-4 text-center">
          <p className="text-sm text-gray-600">Groups Joined</p>
          <p className="mt-2 text-3xl font-bold text-green-700">
            {progress.groupsJoined ?? 0}
          </p>
        </div>

        <div className="rounded-lg bg-purple-100 p-4 text-center">
          <p className="text-sm text-gray-600">Messages Sent</p>
          <p className="mt-2 text-3xl font-bold text-purple-700">
            {progress.messagesSent ?? 0}
          </p>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        🕒 Last active:{" "}
        {progress.lastActive
          ? new Date(progress.lastActive).toLocaleString()
          : "N/A"}
      </div>
    </div>
  );
};

export default TrackProgress;

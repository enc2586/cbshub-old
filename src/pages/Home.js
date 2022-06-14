import * as React from "react";
import { doc, onSnapshot } from "firebase/firestore";

import { db } from "utils/firebase";

function Home() {
  const [announcement, setAnnouncement] = React.useState("공지 불러오는 중...");

  React.useEffect(() => {
    onSnapshot(doc(db, "announcements", "EpXYIjvCIGMUmBmtDL9h"), (doc) => {
      setAnnouncement(doc.data().announcement);
    });
  }, []);

  return (
    <div>
      <h1>Welcome</h1>

      <p>{announcement}</p>
    </div>
  );
}

export default Home;

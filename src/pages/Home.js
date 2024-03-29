import * as React from "react";
import { doc, onSnapshot } from "firebase/firestore";

import { db } from "utils/firebase";
import { Button, Grid, Alert } from "@mui/material";
import {
  MusicNote,
  Create,
  AccessTime,
  Restaurant,
  CalendarMonth,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

function Home() {
  let navigate = useNavigate();

  const openInNewTab = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const [announcement, setAnnouncement] = React.useState("공지 불러오는 중...");

  React.useEffect(() => {
    onSnapshot(doc(db, "announcements", "EpXYIjvCIGMUmBmtDL9h"), (doc) => {
      setAnnouncement(doc.data().announcement);
    });
  }, []);

  return (
    <div>
      <h1>Welcome</h1>

      <Grid justifyContent="center" sx={{ p: 1 }}>
        <Button
          sx={{ m: 0.5 }}
          variant="contained"
          size="large"
          endIcon={<MusicNote />}
          disableElevation
          onClick={() => navigate("/reveille")}
        >
          기상송
        </Button>
        <Button
          sx={{ m: 0.5 }}
          variant="contained"
          size="large"
          endIcon={<AccessTime />}
          disableElevation
          onClick={() => navigate("/workflow")}
        >
          WORKFLOW
        </Button>
        <Button
          sx={{ m: 0.5 }}
          variant="contained"
          size="large"
          endIcon={<Restaurant />}
          disableElevation
          onClick={() =>
            window.open(
              "https://school.cbe.go.kr/cbs-h/M01050705/list#usm-content-footer-id",
              "_blank"
            )
          }
        >
          급식
        </Button>
        <Button
          sx={{ m: 0.5 }}
          variant="contained"
          size="large"
          endIcon={<Create />}
          disableElevation
          onClick={() => window.open("https://www.cbshself.kr", "_blank")}
        >
          자율학습관리시스템
        </Button>
        <Button
          sx={{ m: 0.5 }}
          variant="contained"
          size="large"
          endIcon={<CalendarMonth />}
          disableElevation
          onClick={() =>
            window.open("http://xn--s39aj90b0nb2xw6xh.kr/", "_blank")
          }
        >
          시간표
        </Button>
      </Grid>

      <p>공지: {announcement}</p>
    </div>
  );
}

export default Home;

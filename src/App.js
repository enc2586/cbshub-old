import "./App.css";

import * as React from "react";

import userfrontConfig from "auth/userfront.json";

import { Routes, Route, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container } from "react-bootstrap";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Userfront from "@userfront/react";
import { RequireAuth } from "utils/authMgmt";
import { toast, ToastContainer } from "react-toastify";

import { doc, updateDoc } from "firebase/firestore";
import { db } from "utils/firebase";

import "react-toastify/dist/ReactToastify.css";

import { userRef, getUserData } from "utils/getUserData";

import {
  Home,
  MorningMusic,
  MorningMusicMgmt,
  NotFound,
  Login,
  Signup,
  PasswordReset,
  Workflow,
} from "pages";

Userfront.init(userfrontConfig.key);

function App() {
  const hasSetName = React.useRef(false);

  const descriptionElementRef = React.useRef(null);
  const [open, setOpen] = React.useState(false);

  const [name, setName] = React.useState("");

  if (Userfront.tokens.accessToken && !hasSetName.current) {
    const setUserName = async () => {
      hasSetName.current = true;
      const userSnap = await getUserData();
      setName(userSnap.name);
    };
    setUserName();
  } else {
    hasSetName.current = false;
  }

  React.useEffect(() => {
    const init = async () => {
      const userSnap = await getUserData();

      if (userSnap.hasReadAnnouncement === false) {
        setOpen(true);
      }
    };

    init();
  }, []);

  const handleClose = (markRead = false) => {
    setOpen(false);

    if (markRead === true) {
      updateDoc(userRef(), {
        hasReadAnnouncement: true,
      });
    }
  };

  let navigate = useNavigate();

  const handleLogout = async () => {
    await Userfront.logout({ redirect: false });
    toast.info("성공적으로 로그아웃했어요.");
    navigate("/login");
  };

  const THEME = createTheme({
    typography: {
      fontFamily: `"sf-pro", "sd-gothic"`,
    },
  });

  return (
    <div>
      <ThemeProvider theme={THEME}>
        <Navbar bg="light" expand="lg">
          <Container>
            <Navbar.Brand onClick={() => navigate("/")}>CBSHub</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link onClick={() => navigate("/reveille")}>
                  기상송
                </Nav.Link>
                <Nav.Link onClick={() => navigate("/workflow")}>
                  WORKFLOW
                </Nav.Link>
              </Nav>
              <Nav className="justify-content-end">
                {Userfront.tokens.accessToken ? (
                  <Navbar.Text>
                    안녕하세요, <b>{name}</b> 님!
                  </Navbar.Text>
                ) : null}

                {!Userfront.tokens.accessToken ? (
                  <Nav.Link onClick={() => navigate("/login")}>
                    <b>로그인</b>
                  </Nav.Link>
                ) : (
                  <Nav.Link onClick={() => handleLogout()}>
                    <b>로그아웃</b>
                  </Nav.Link>
                )}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <Grid
          container
          item
          direction="column"
          justifyContent="center"
          alignItems="center"
        >
          <div style={{ height: 50 }} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/reveille"
              element={
                <RequireAuth>
                  <MorningMusic />
                </RequireAuth>
              }
            />
            <Route
              path="/reveille/manage"
              element={
                <RequireAuth>
                  <MorningMusicMgmt />
                </RequireAuth>
              }
            />
            <Route
              path="/workflow"
              element={
                <RequireAuth>
                  <Workflow />
                </RequireAuth>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/passwordReset" element={<PasswordReset />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Grid>

        <Dialog
          open={open}
          onClose={() => handleClose()}
          scroll="paper"
          aria-labelledby="scroll-dialog-title"
          aria-describedby="scroll-dialog-description"
        >
          <DialogTitle id="scroll-dialog-title">
            통합 마이그레이션 및 버그 수정 완료
          </DialogTitle>
          <DialogContent dividers>
            <DialogContentText
              id="scroll-dialog-description"
              ref={descriptionElementRef}
              tabIndex={-1}
            >
              <b>세줄요약:</b>
              <br />
              1. 자습을 봇이 정상적으로 신청했는지 표시됩니다.
              <br />
              2. 기상송 조회 리스트가 실시간으로 동기화됩니다(새로고침 필요
              없음).
              <br />
              3. 기상송은 이제 익명으로 신청되며 신청 가능 곡 수가 제한됩니다.
              <br />
              <br />
              <b>변경 사항:</b>
              <br />- 마이그레이션: 웹 호스트: Heroku에서 Netlify로
              <br />- 마이그레이션: 데이터베이스: Firebase Realtime에서 Firebase
              Firestore로
              <br />- 마이그레이션: 자동화: Github Actions에서 WayScript로
              <br />- 버그 수정: 구획 문자를 포함한 음악 제목이 관리 도구에서
              삭제되지 않던 문제
              <br />- 기능 수정: WORKFLOW 인증 정보 추가 탭을 버튼 속에 숨김
              <br />- 기능 추가: WORKFLOW 봇이 정상적으로 신청했는지 표시
              <br />- 기능 추가: 기상송 조회 리스트가 실시간으로 동기화됨
              <br />- 디자인 수정: 글꼴이 변경됨
              <br />- 기타: 코드 가독성 개선 작업
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => handleClose(true)}>다시 보지 않기</Button>
            <Button onClick={() => handleClose()}>닫기</Button>
          </DialogActions>
        </Dialog>

        <ToastContainer position="bottom-left" />
      </ThemeProvider>
    </div>
  );
}

export default App;

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
  // if (!window.location.href.split(":").includes("https")) {
  //   var newlink = window.location.href.split(":").slice(1);
  //   newlink.unshift("https");
  //   window.location.href = newlink.join(":");
  // }

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
            기능 추가 및 마이그레이션 완료 (ver. 0.9.3b)
          </DialogTitle>
          <DialogContent dividers>
            <DialogContentText
              id="scroll-dialog-description"
              ref={descriptionElementRef}
              tabIndex={-1}
            >
              1. 신청곡 리스트에 신청자명이 표시됩니다.
              <br />
              2. 신청 취소 기능이 추가되었습니다.
              <br />
              3. 신청곡 리스트에 더 많은 행이 보입니다.
              <br />
              <br />
              <b>변경 사항:</b>
              <br />- 마이그레이션: 호스팅: Heroku에서 CloudFlare로
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

import * as React from "react";
import { flushSync } from "react-dom";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  increment,
} from "firebase/firestore";

import Userfront from "@userfront/core";
import UserfrontConfig from "auth/userfront.json";

import { toast } from "react-toastify";

import { db } from "utils/firebase";
import {
  Grid,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
} from "@mui/material";
import { Reviews } from "@mui/icons-material";
import { Button } from "react-bootstrap";

Userfront.init(UserfrontConfig.key);

function MorningMusicMgmt() {
  React.useEffect(() => {
    const init = async () => {
      try {
        const defaultDormitory = await getDormitory(Userfront.user.userUuid);
        setDormitory(defaultDormitory);
      } catch (e) {
        console.error("기본 기숙사 정보를 받아오는 도중 문제가 생겼어요.");
        console.error(e);
        toast.error(
          <div>
            처리하지 못한 오류가 일어났어요.
            <br />
            반복된다면 관리자에게 문의해주세요.
          </div>,
          { toastId: "noUserData" }
        );
      }

      try {
        const sareumRef = collection(db, "reveille", "sareum", "queue");
        const sareumQ = query(sareumRef, orderBy("appliedOn", "asc"));
        onSnapshot(sareumQ, (docs) => {
          var reveilleList = [];

          docs.forEach((doc) => {
            var docWithId = doc.data();
            docWithId["id"] = doc.id;
            reveilleList.push(docWithId);
          });

          setSareumQueue(reveilleList);
        });

        const chungwoonRef = collection(db, "reveille", "chungwoon", "queue");
        const chungwoonQ = query(chungwoonRef, orderBy("appliedOn", "asc"));
        onSnapshot(chungwoonQ, (docs) => {
          var reveilleList = [];

          docs.forEach((doc) => {
            var docWithId = doc.data();
            docWithId["id"] = doc.id;
            reveilleList.push(docWithId);
          });

          setChungwoonQueue(reveilleList);
        });
      } catch (e) {
        console.error(
          "기숙사별 기상음악 실시간 받아오기 설정 도중 문제가 생겼어요."
        );
        console.error(e);
        toast.error(
          <div>
            처리하지 못한 오류가 일어났어요.
            <br />
            반복된다면 관리자에게 문의해주세요.
          </div>,
          { toastId: "reveilleRealTimeInitError" }
        );
      }
    };
    init();
  }, []);

  const [dormitory, setDormitory] = React.useState("");
  const [sareumQueue, setSareumQueue] = React.useState([]);
  const [chungwoonQueue, setChungwoonQueue] = React.useState([]);

  const getDormitory = async (uuid) => {
    const userRef = doc(db, "users", uuid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data().dormitory;
    } else {
      throw (
        "사용자 [" +
        uuid +
        "] 의 프로필은 존재하지만, 데이터는 존재하지 않습니다."
      );
    }
  };

  const playedProcess = (key) => async () => {
    const musicRef = doc(db, "reveille", dormitory, "queue", key);
    const musicData = await (await getDoc(musicRef)).data();

    const playedRef = doc(db, "reveille", dormitory, "played", key);
    const playedData = {
      ...musicData,
      playedOn: serverTimestamp(),
    };

    setDoc(playedRef, playedData);
    deleteDoc(musicRef);

    const userRef = doc(db, "users", musicData.user);

    await updateDoc(userRef, {
      reveilleRequests: increment(-1),
    });

    toast.success("재생처리가 완료되었어요");
  };

  return (
    <div>
      <Grid container direction="column" alignItems="center">
        <h1>Reville Management</h1>
        <span>음악을 클릭해 재생 완료 처리합니다</span>
        <FormControl>
          <RadioGroup
            row
            aria-labelledby="demo-controlled-radio-buttons-group"
            name="controlled-radio-buttons-group"
            value={dormitory}
            onChange={(e) => {
              setDormitory(e.target.value);
            }}
          >
            <FormControlLabel
              value="sareum"
              control={<Radio />}
              label="사름학사"
            />
            <FormControlLabel
              value="chungwoon"
              control={<Radio />}
              label="청운학사"
            />
          </RadioGroup>
        </FormControl>

        <Paper style={{ height: 400, overflow: "auto" }}>
          <List sx={{ width: 350 }}>
            {(dormitory == "sareum"
              ? sareumQueue.length
              : chungwoonQueue.length) != 0 ? (
              dormitory == "sareum" ? (
                sareumQueue.map((item) => (
                  <ListItem key={item.id} disablePadding>
                    <ListItemButton onClick={playedProcess(item.id)}>
                      <ListItemText primary={item.title} />
                    </ListItemButton>
                  </ListItem>
                ))
              ) : (
                chungwoonQueue.map((item) => (
                  <ListItem key={item.id} disablePadding>
                    <ListItemButton onClick={playedProcess(item.id)}>
                      <ListItemText primary={item.title} />
                    </ListItemButton>
                  </ListItem>
                ))
              )
            ) : (
              <ListItem>
                <ListItemText primary="신청된 곡이 없어요. 하나 신청해보세요!" />
              </ListItem>
            )}
          </List>
        </Paper>
      </Grid>
    </div>
  );
}

export default MorningMusicMgmt;

import * as React from "react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  serverTimestamp,
  addDoc,
  increment,
  updateDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { db } from "utils/firebase";
import { getUserData } from "utils/getUserData";

import Userfront from "@userfront/core";
import UserfrontConfig from "auth/userfront.json";

import {
  ArrowForward,
  Key,
  Backspace,
  Filter,
  CopyAll,
} from "@mui/icons-material";

import {
  FormLabel,
  FormControl,
  FormControlLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  RadioGroup,
  Radio,
  Stack,
  Grid,
  Paper,
  TextField,
  Button,
  IconButton,
} from "@mui/material";

import { toast } from "react-toastify";
import { searchMusic } from "utils/musicAPI";
import { async } from "@firebase/util";
import { useNavigate } from "react-router-dom";
Userfront.init(UserfrontConfig.key);

function MorningMusic() {
  const [open, setOpen] = React.useState(false);

  let navigate = useNavigate();

  React.useEffect(() => {
    searchRef.current.focus();
    init();
  }, []);

  const [isReveilleAdmin, setReveilleAdmin] = React.useState(false);

  const [searchResults, setSearchResults] = React.useState([]);
  const [musicRequests, setMusicRequests] = React.useState({
    current: 0,
    max: 0,
  });

  const init = async () => {
    const userSnap = await getUserData();

    setReveilleAdmin(userSnap.authority.includes("reveilleManager"));

    changeDormitory(userSnap.dormitory);
    refreshMusicRequestsStatus(userSnap.reveilleRequests);
    getUsersList();
  };

  const getUsersList = async () => {
    const usersCollectionRef = collection(db, "users");
    const usersQuerySnapshot = await getDocs(usersCollectionRef);

    var usersTempList = {};
    usersQuerySnapshot.forEach((doc) => {
      usersTempList[doc.id] = doc.data().name;
    });

    setUsersList(usersTempList);
  };

  const refreshMusicRequestsStatus = async (current = undefined) => {
    var currentRequests = 0;
    var requestsLimit = await getReveilleRequestsLimit();

    if (current !== undefined) {
      currentRequests = current;
    } else {
      const userSnap = await getUserData();
      currentRequests = userSnap.reveilleRequests;
    }

    setMusicRequests({
      current: currentRequests,
      max: requestsLimit,
    });
  };

  const getReveilleRequestsLimit = async (uid = Userfront.user.userUuid) => {
    const reveilleConfigRef = doc(db, "reveille", "Config");
    const reveilleConfigData = await getDoc(reveilleConfigRef);

    if (reveilleConfigData.data().maxRequests[uid] !== undefined) {
      return reveilleConfigData.data().maxRequests[uid];
    } else {
      return reveilleConfigData.data().maxRequests["default"];
    }
  };

  const [usersList, setUsersList] = React.useState({});

  const [dormitory, setDormitory] = React.useState(null);

  const searchRef = React.useRef(null);

  const [isDisabled, setIsDisabled] = React.useState(true);

  const [music, setMusic] = React.useState({
    query: "",
    selected: "",
    arelocked: false,
    error: false,
    message: null,
  });

  const [morningMusicList, setMorningMusicList] = React.useState([]);

  const handleQueryChange = async (e) => {
    setMusic({
      ...music,
      query: e.target.value,
    });

    var res = await searchAndUpdate(e.target.value);

    setSearchResults(res);
  };

  const searchAndUpdate = async (title) => {
    var queryResult = await searchMusic(title);

    var titles = queryResult.map((x) => x.name);
    var artists = queryResult.map((x) => x.artist);

    var parsed = titles.map(function (x, i) {
      return x.concat(" - ", artists[i]);
    });

    return parsed;
  };

  const changeDormitory = (dormitory) => {
    setDormitory(dormitory);

    onSnapshot(collection(db, "reveille", dormitory, "queue"), (docs) => {
      setDormitory(dormitory);

      var sortedDocs = [];

      docs.forEach((doc) => {
        var docWithId = doc.data();
        docWithId["id"] = doc.id;

        sortedDocs.push(docWithId);
      });

      sortedDocs.sort((a, b) => {
        return a.appliedOn.seconds - b.appliedOn.seconds;
      });

      setMorningMusicList(sortedDocs);
      // console.log(sortedDocs);
    });
  };

  const applyMusic = async () => {
    setIsDisabled(true);

    const morningMusicRef = collection(db, "reveille", dormitory, "queue");

    const musicData = {
      title: music.selected,
      user: Userfront.user.userUuid,
      appliedOn: serverTimestamp(),
    };

    await addDoc(morningMusicRef, musicData);

    const userRef = doc(db, "users", Userfront.user.userUuid);

    await updateDoc(userRef, {
      reveilleRequests: increment(1),
    });
    musicRequests.current += 1;

    await setMusic({
      ...music,
      selected: "",
    });
  };

  const tryRemove = async (item) => {
    if (item.user === Userfront.user.userUuid) {
      if (filterWords(item.title) == true) {
        await deleteDoc(doc(db, "reveille", dormitory, "queue", item.id));

        await updateDoc(userRef, {
          reveilleRequests: increment(-1),
        });
        musicRequests.current -= 1;

        const userRef = doc(db, "users", Userfront.user.userUuid);

        toast.info("삭제처리가 완료되었습니다.");
      } else {
        toast.error("금칙어가 포함되어 작업을 할 수 없음", { toastId: "ban1" });
        toast.info(
          <div>
            신청할 땐 마음대로였겠지만
            <br />
            삭제할 땐 아니랍니다 ^^
          </div>,
          {
            toastId: "ban2",
          }
        );
      }
    }
  };

  const filterWords = (title) => {
    const filterList = ["무현", "문재인", "박근혜", "섹스"];

    for (var index in filterList) {
      if (title.includes(filterList[index])) {
        return false;
      }
    }
    return true;
  };

  // const getUserData = async (uid = Userfront.user.userUuid) => {
  //   const userRef = doc(db, "users", uid);
  //   const userSnap = await getDoc(userRef);

  //   if (userSnap.exists()) {
  //     return userSnap.data();
  //   } else {
  //     toast.error(
  //       <div>
  //         심각한 오류가 일어났어요.
  //         <br />
  //         반복된다면 관리자에게 문의해주세요.
  //       </div>,
  //       { toastId: "noUserData" }
  //     );
  //     console.error(
  //       "사용자 [" +
  //         Userfront.user.userUuid +
  //         "] 의 프로필은 존재하지만, 데이터는 존재하지 않습니다."
  //     );
  //     throw (
  //       "사용자 [" +
  //       Userfront.user.userUuid +
  //       "] 의 프로필은 존재하지만, 데이터는 존재하지 않습니다."
  //     );
  //   }
  // };

  return (
    <div>
      <Grid container direction="column" alignItems="center">
        <h1>신청곡</h1>
        <FormControl>
          <RadioGroup
            row
            aria-labelledby="demo-controlled-radio-buttons-group"
            name="controlled-radio-buttons-group"
            value={dormitory}
            onChange={(e) => {
              changeDormitory(e.target.value);
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

        <Grid container direction="row" justifyContent="center" spacing={3}>
          <Grid
            container
            item
            spacing={1}
            direction="column"
            sx={{ width: 350 }}
          >
            <h2>신청</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <TextField
                variant="filled"
                inputRef={searchRef}
                label="제목 또는 가수"
                value={music.query}
                onChange={handleQueryChange}
                fullWidth
              />
            </form>
            <Paper style={{ height: 250, overflow: "auto" }}>
              <List sx={{ maxWidth: 350 }}>
                {searchResults.length != 0 ? (
                  searchResults.map((item) => (
                    <ListItem key={item} disablePadding>
                      <ListItemButton
                        onClick={() => {
                          setMusic({
                            ...music,
                            selected: item,
                          });
                          if (item != "") {
                            setIsDisabled(false);
                          }
                        }}
                      >
                        <ListItemText primary={item} />
                      </ListItemButton>
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="제목 또는 가수를 입력해주세요" />
                  </ListItem>
                )}
              </List>
            </Paper>
            <span>선택:</span>
            <Grid container direction="row">
              <h4
                style={{
                  color: music.selected == "" ? null : "#0d6efd",
                  width: "79%",
                }}
              >
                {music.selected == ""
                  ? "선택한 음악이 없습니다"
                  : music.selected}
              </h4>
              <Button
                disabled={isDisabled}
                variant="contained"
                size="small"
                sx={{ height: "100%" }}
                disableElevation
                endIcon={<ArrowForward />}
                onClick={() => {
                  applyMusic();
                }}
              >
                추가
              </Button>
            </Grid>
          </Grid>
          <Grid container item spacing={1} direction="column" width={350}>
            <h2>조회</h2>
            <Paper style={{ height: 306, overflow: "auto" }}>
              <List sx={{ maxWidth: 350 }} dense={true}>
                {morningMusicList.length != 0 ? (
                  morningMusicList.map((item) => (
                    <ListItem
                      key={item.id}
                      secondaryAction={
                        item.user == Userfront.user.userUuid ? (
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => tryRemove(item)}
                          >
                            <Backspace />
                          </IconButton>
                        ) : null
                      }
                    >
                      <ListItemButton
                        sx={{ m: 0, p: 0 }}
                        onClick={() => {
                          navigator.clipboard.writeText(item.title);
                          toast.info("제목을 복사했어요");
                        }}
                      >
                        <ListItemText
                          primary={item.title}
                          secondary={"신청자: " + usersList[item.user]}
                          sx={{ m: 0 }}
                        />
                        {/* <ListItemButton
                        onClick={() => tryRemove(item)}
                        >
                        </ListItemButton> */}
                      </ListItemButton>
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="신청된 곡이 없어요. 하나 신청해보세요!" />
                  </ListItem>
                )}
              </List>
            </Paper>

            <span style={{ textAlign: "right" }}>신청 가능한 음악 수</span>
            <h4 style={{ textAlign: "right" }}>
              {musicRequests.max - musicRequests.current}곡 더 신청 가능
            </h4>
          </Grid>
        </Grid>

        {isReveilleAdmin ? (
          <Grid container direction="column" alignItems="center">
            <Button
              variant="contained"
              size="big"
              sx={{ width: "50%", mt: 5 }}
              disableElevation
              endIcon={<CopyAll />}
              onClick={() => {
                var t = "";
                morningMusicList.forEach(function (item, index) {
                  if (index <= 8) {
                    t += item.title;
                    t += "\n";
                  }
                });
                navigator.clipboard.writeText(t);

                toast.info("제목을 복사했어요");
              }}
            >
              하루 분량 제목 복사
            </Button>
            <Button
              variant="contained"
              size="big"
              sx={{ width: "50%", m: 2 }}
              disableElevation
              endIcon={<Key />}
              onClick={() => {
                navigate("/reveille/manage");
              }}
            >
              관리자 메뉴로
            </Button>
          </Grid>
        ) : null}
      </Grid>
    </div>
  );
}

export default MorningMusic;

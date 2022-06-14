import * as React from "react";
import { flushSync } from "react-dom";
import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
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
  Switch,
  Radio,
  RadioGroup,
  FormGroup,
  FormControl,
  FormControlLabel,
  Autocomplete,
  TextField,
  Box,
  Button,
  Typography,
  Checkbox,
  FormLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
} from "@mui/material";

import { DeleteForever } from "@mui/icons-material";

import { getUserData, userRef } from "utils/getUserData";
import IOSSwitch from "utils/IOSSwitch";

Userfront.init(UserfrontConfig.key);

function Workflow() {
  const init = async () => {
    const userSnap = await getUserData();

    if ("cbshselfCredential" in userSnap) {
      setHasRegisteredCredential(true);
      const workflowConfigRef = doc(db, "workflow", "Config");

      onSnapshot(workflowConfigRef, (doc) => {
        if (
          doc.data().status === "initialize" ||
          doc.data().status === "running"
        ) {
          setIsDisabled(true);
        } else {
          setIsDisabled(false);
        }

        setBotStatus(doc.data().status);
        setTeachersList(Object.keys(doc.data().teachers));
        setClassesList(Object.keys(doc.data().classes));

        nameMap.current = {
          teachers: doc.data().teachers,
          classes: doc.data().classes,
        };

        var tempTeachersList = {};
        Object.keys(doc.data().teachers).forEach((key, _index) => {
          tempTeachersList[doc.data().teachers[key]] = key;
        });

        var tempClassesList = {};
        Object.keys(doc.data().classes).forEach((key, _index) => {
          tempClassesList[doc.data().classes[key]["id"]] = key;
        });
        setCodeMap({
          teachers: tempTeachersList,
          classes: tempClassesList,
        });
      });
    } else {
      setHasRegisteredCredential(false);
    }

    onSnapshot(doc(db, "workflow", Userfront.user.userUuid), (doc) => {
      setWorkflowHasError(false);
      setNoTomorrow(false);
      if (doc.data() === undefined) {
        setWorkflows([]);
      } else {
        var workflowsObject = doc.data();
        console.log(workflowsObject);
        delete workflowsObject.Config;

        setWorkflows(workflowsObject);

        Object.keys(workflowsObject).forEach((key) => {
          const item = workflowsObject[key];
          if (item.status === "loginFailed" || item.status === "fail") {
            setWorkflowHasError(true);
          }
          if (item.status === "tomorrow") {
            setNoTomorrow(true);
          }
        });
      }
    });
  };

  React.useEffect(() => {
    init();
  }, []);

  const handleCredentialClose = async (saveCredential = false) => {
    setOpenCredentials(false);

    if (saveCredential === true) {
      if (cred.id.length === 0 || cred.password.length === 0) {
        toast.error("정보를 등록할 수 없습니다");
        return;
      }
      const userRef = doc(db, "users", Userfront.user.userUuid);
      await updateDoc(userRef, {
        cbshselfCredential: {
          id: cred.id,
          password: cred.id,
        },
      });

      toast.success("정보 등록에 성공했습니다");

      setCred({
        id: "",
        password: "",
      });

      init();
    }
  };

  const [hasRegisteredCredential, setHasRegisteredCredential] =
    React.useState(true);

  const [cred, setCred] = React.useState({
    id: "",
    password: "",
  });
  const [openCredentials, setOpenCredentials] = React.useState(false);
  const [botStatus, setBotStatus] = React.useState("");

  const [workflowHasError, setWorkflowHasError] = React.useState(false);
  const [noTomorrow, setNoTomorrow] = React.useState(false);

  const teacherName = React.useRef("");
  const className = React.useRef("");

  const [isDisabled, setIsDisabled] = React.useState(true);

  const [codeMap, setCodeMap] = React.useState({
    teachers: {},
    classes: {},
  });
  const nameMap = React.useRef({});

  const [teachersList, setTeachersList] = React.useState([]);
  const [classesList, setClassesList] = React.useState([]);
  const [workflows, setWorkflows] = React.useState([]);

  const [isWeekend, setIsWeekend] = React.useState(false);
  const [selected, setSelected] = React.useState({
    dayOfWeek: [false, false, false, false, false, false, false],
    periods: [false, false, false, false, false, false, false, false],
  });

  const addWorkflow = async () => {
    var dayOfWeekBool = selected.dayOfWeek;
    var periodsBool = selected.periods;
    const weekend = isWeekend;

    if (
      (weekend
        ? dayOfWeekBool[5] || dayOfWeekBool[6]
        : dayOfWeekBool[0] ||
          dayOfWeekBool[1] ||
          dayOfWeekBool[2] ||
          dayOfWeekBool[3] ||
          dayOfWeekBool[4]) === false
    ) {
      toast.error("요일을 선택해주세요");
      return;
    }

    if (
      (periodsBool[0] ||
        periodsBool[1] ||
        periodsBool[2] ||
        (weekend
          ? periodsBool[3] ||
            periodsBool[4] ||
            periodsBool[5] ||
            periodsBool[6] ||
            periodsBool[7]
          : false)) === false
    ) {
      toast.error("교시를 선택해주세요");
      return;
    }

    if (teacherName.current == "") {
      toast.error("선생님을 선택해주세요");
      return;
    }

    if (className.current == "") {
      toast.error("교실을 선택해주세요");
      return;
    }

    const teacherCode = nameMap.current.teachers[teacherName.current];
    const classCode = nameMap.current.classes[className.current].id;

    var dayOfWeekArray = [];
    var periodsArray = [];

    dayOfWeekBool.forEach((value, index) => {
      if (weekend ? index >= 5 : index < 5) {
        if (value) {
          dayOfWeekArray.push(index);
        }
      }
    });
    periodsBool.forEach((value, index) => {
      if (weekend ? true : index <= 2) {
        if (value) {
          periodsArray.push(index + 1);
        }
      }
    });

    const today = new Date();
    var todayDay = today.getDay() - 1;

    if (todayDay === -1) {
      todayDay = 6;
    }

    console.log(todayDay);

    console.log(today);

    const workflowData = {
      actCode: "ACT999",
      actContent: " ",
      classroomCode: classCode,
      conductingTeacherCode: teacherCode,
      dayOfWeek: dayOfWeekArray,
      periods: periodsArray,
      status: dayOfWeekArray.includes(todayDay)
        ? botStatus === "ready"
          ? "ready"
          : "tomorrow"
        : "notToday",
      suspend: [],
    };

    const workflowRef = doc(db, "workflow", Userfront.user.userUuid);

    const checkDoc = await getDoc(workflowRef);

    var duplication = false;

    if (checkDoc.exists()) {
      const existingWorkflow = checkDoc.data();
      Object.keys(existingWorkflow).forEach((key) => {
        const item = existingWorkflow[key];

        if (
          item.dayOfWeek.filter((x) => dayOfWeekArray.includes(x)).length !== 0
        ) {
          if (
            item.periods.filter((x) => periodsArray.includes(x)).length !== 0
          ) {
            toast.error("다른 예약과 시간이 겹쳐요");
            duplication = true;
            return;
          }
        }
      });

      if (duplication) {
        return;
      }

      var newIndex = "0";
      if (Object.keys(workflows).length !== 0) {
        newIndex = Math.max(...Object.keys(workflows)) + 1;
      }
      var newWorkflow = {};
      newWorkflow[newIndex] = workflowData;
      updateDoc(workflowRef, newWorkflow);
    } else {
      var newWorkflow = {};
      newWorkflow["0"] = workflowData;
      setDoc(workflowRef, newWorkflow);
    }
  };

  function Reserve({ flowId, data }) {
    const dayOfWeekConvert = (dayOfWeekArray) => {
      const weeks = ["월", "화", "수", "목", "금", "토", "일"];
      var daysInFlow = [];
      console.log(dayOfWeekArray);

      dayOfWeekArray.forEach((item) => {
        daysInFlow.push(weeks[item]);
      });

      return daysInFlow.join(" / ");
    };

    console.log(codeMap.classes, data.classroomCode);
    const classroom = codeMap.classes[data.classroomCode];
    const teacher = codeMap.teachers[data.conductingTeacherCode];
    const dayOfWeek = dayOfWeekConvert(data.dayOfWeek);
    const periods = data.periods.join(" / ");

    var deleteObject = {};
    deleteObject[flowId] = deleteField();
    return (
      <Box
        sx={{ borderRadius: 1, width: 350, p: 1.5, mb: 2 }}
        bgcolor="#ececec"
      >
        {data.status == "tomorrow" ? (
          <Alert severity="warning" sx={{ width: "100%", mb: 1 }}>
            내일부터 신청됩니다
          </Alert>
        ) : null}
        {data.status == "ready" ? (
          <Alert severity="info" sx={{ width: "100%", mb: 1 }}>
            오늘 지정된 시간에 신청됩니다
          </Alert>
        ) : null}
        {data.status == "success" ? (
          <Alert severity="success" sx={{ width: "100%", mb: 1 }}>
            신청에 성공했습니다
          </Alert>
        ) : null}
        {data.status == "loginFailed" ? (
          <Alert severity="error" sx={{ width: "100%", mb: 1 }}>
            로그인 단계에서 오류가 발생했습니다
          </Alert>
        ) : null}
        {data.status == "fail" ? (
          <Alert severity="error" sx={{ width: "100%", mb: 1 }}>
            1개 이상의 교시에 대한 신청이 실패했습니다
          </Alert>
        ) : null}
        {data.status == "notToday" ? (
          <Alert severity="info" sx={{ width: "100%", mb: 1 }}>
            오늘은 신청 요일이 아닙니다
          </Alert>
        ) : null}

        <h4 className="notbold">
          <b>{classroom}</b> (으)로,
        </h4>
        <h6 className="notbold">
          <b>{teacher}</b> 선생님께,
        </h6>
        <h6 className="notbold">
          <b>{dayOfWeek}</b> 요일에,
        </h6>
        <h6 className="notbold">
          <b>{periods}</b> 교시에 자습을 신청할께요.
        </h6>
        <Button
          endIcon={<DeleteForever />}
          variant="contained"
          disabled={isDisabled}
          onClick={() => {
            updateDoc(
              doc(db, "workflow", Userfront.user.userUuid),
              deleteObject
            );
            toast.success("성공적으로 삭제했습니다");
          }}
          disableElevation
          // disabled={isDeleteButtonDisabled}
        >
          삭제
        </Button>
      </Box>
    );
  }

  return (
    <div>
      <Grid container direction="column" alignItems="center">
        <h1>WORKFLOW</h1>
        {hasRegisteredCredential ? null : (
          // {false ? null : (
          <Alert
            severity="warning"
            sx={{ width: "100%", mb: 2 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => setOpenCredentials(true)}
              >
                등록하기
              </Button>
            }
          >
            학생관리시스템 인증 정보가 등록되지 않아 사용할 수 없습니다.
          </Alert>
        )}
        {botStatus === "running" ? (
          <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
            현재 WORKFLOW가 작동 중입니다. 약 1분 소요되며, 그 동안 신규 예약을
            할 수 없습니다.
          </Alert>
        ) : null}
        {botStatus === "finished" ? (
          <Alert severity="info" sx={{ width: "100%", mb: 2 }}>
            오늘치 WORKFLOW는 이미 작동하였습니다. 신규 예약은 내일부터
            신청됩니다.
          </Alert>
        ) : null}
        {botStatus === "initialize" ? (
          <Alert severity="info" sx={{ width: "100%", mb: 2 }}>
            내일의 WORKFLOW를 위해 봇을 초기화하는 중입니다. 이 시간에 왜
            접속하셨죠..?
          </Alert>
        ) : null}
        {workflowHasError === true ? (
          <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
            귀하의 WORKFLOW가 작동 중 오류를 발생시켰습니다
          </Alert>
        ) : botStatus === "finished" && noTomorrow === true > 0 ? (
          <Alert severity="success" sx={{ width: "100%", mb: 2 }}>
            모든 WORKFLOW가 정상적으로 신청되었습니다.
          </Alert>
        ) : null}

        <Grid container item direction="row" justifyContent="center">
          <Grid
            container
            item
            direction="column"
            spacing={1}
            sx={{ width: 350, mb: 5 }}
          >
            <h2>예약하기</h2>
            <Autocomplete
              sx={{ width: 300, m: 1 }}
              disablePortal
              onChange={(event, value) => (teacherName.current = value)}
              options={teachersList}
              renderInput={(params) => (
                <TextField {...params} label="지도 선생님" variant="filled" />
              )}
            />
            <Autocomplete
              sx={{ width: 300, m: 1 }}
              disablePortal
              onChange={(event, value) => (className.current = value)}
              options={classesList}
              renderInput={(params) => (
                <TextField {...params} label="장소" variant="filled" />
              )}
            />
            <Grid container direction="row" alignItems="center" sx={{ m: 1 }}>
              <Typography>평일</Typography>
              <IOSSwitch
                sx={{ m: 1 }}
                onChange={(event) => {
                  setIsWeekend(event.target.checked);
                }}
              />
              <Typography>주말</Typography>
            </Grid>

            {!isWeekend ? (
              <Grid container direction="row" sx={{ m: 1 }}>
                <FormLabel component="legend">요일</FormLabel>
                <FormControlLabel
                  sx={{ m: 1 }}
                  control={<Checkbox />}
                  label="월"
                  checked={selected.dayOfWeek[0]}
                  onChange={(event) => {
                    var tempDayOfWeekSelected = [...selected.dayOfWeek];
                    tempDayOfWeekSelected[0] = event.target.checked;
                    setSelected({
                      ...selected,
                      dayOfWeek: tempDayOfWeekSelected,
                    });
                  }}
                  labelPlacement="top"
                />
                <FormControlLabel
                  sx={{ m: 1 }}
                  control={<Checkbox />}
                  label="화"
                  checked={selected.dayOfWeek[1]}
                  onChange={(event) => {
                    var tempDayOfWeekSelected = [...selected.dayOfWeek];
                    tempDayOfWeekSelected[1] = event.target.checked;
                    setSelected({
                      ...selected,
                      dayOfWeek: tempDayOfWeekSelected,
                    });
                  }}
                  labelPlacement="top"
                />
                <FormControlLabel
                  sx={{ m: 1 }}
                  control={<Checkbox />}
                  label="수"
                  checked={selected.dayOfWeek[2]}
                  onChange={(event) => {
                    var tempDayOfWeekSelected = [...selected.dayOfWeek];
                    tempDayOfWeekSelected[2] = event.target.checked;
                    setSelected({
                      ...selected,
                      dayOfWeek: tempDayOfWeekSelected,
                    });
                  }}
                  labelPlacement="top"
                />
                <FormControlLabel
                  sx={{ m: 1 }}
                  control={<Checkbox />}
                  label="목"
                  checked={selected.dayOfWeek[3]}
                  onChange={(event) => {
                    var tempDayOfWeekSelected = [...selected.dayOfWeek];
                    tempDayOfWeekSelected[3] = event.target.checked;
                    setSelected({
                      ...selected,
                      dayOfWeek: tempDayOfWeekSelected,
                    });
                  }}
                  labelPlacement="top"
                />
                <FormControlLabel
                  sx={{ m: 1 }}
                  control={<Checkbox />}
                  label="금"
                  checked={selected.dayOfWeek[4]}
                  onChange={(event) => {
                    var tempDayOfWeekSelected = [...selected.dayOfWeek];
                    tempDayOfWeekSelected[4] = event.target.checked;
                    setSelected({
                      ...selected,
                      dayOfWeek: tempDayOfWeekSelected,
                    });
                  }}
                  labelPlacement="top"
                />
              </Grid>
            ) : (
              <Grid container direction="row" sx={{ m: 1 }}>
                <FormLabel component="legend">요일</FormLabel>
                <FormControlLabel
                  sx={{ m: 1 }}
                  control={<Checkbox />}
                  label="토"
                  checked={selected.dayOfWeek[5]}
                  onChange={(event) => {
                    var tempDayOfWeekSelected = [...selected.dayOfWeek];
                    tempDayOfWeekSelected[5] = event.target.checked;
                    setSelected({
                      ...selected,
                      dayOfWeek: tempDayOfWeekSelected,
                    });
                  }}
                  labelPlacement="top"
                />
                <FormControlLabel
                  sx={{ m: 1 }}
                  control={<Checkbox />}
                  label="일"
                  checked={selected.dayOfWeek[6]}
                  onChange={(event) => {
                    var tempDayOfWeekSelected = [...selected.dayOfWeek];
                    tempDayOfWeekSelected[6] = event.target.checked;
                    setSelected({
                      ...selected,
                      dayOfWeek: tempDayOfWeekSelected,
                    });
                  }}
                  labelPlacement="top"
                />
              </Grid>
            )}

            <Grid container direction="row" sx={{ m: 1 }}>
              <FormLabel component="legend">교시</FormLabel>
              <FormControlLabel
                sx={{ m: 1 }}
                control={<Checkbox />}
                label="1"
                checked={selected.periods[0]}
                onChange={(event) => {
                  var tempPeriodsSelected = [...selected.periods];
                  tempPeriodsSelected[0] = event.target.checked;
                  setSelected({
                    ...selected,
                    periods: tempPeriodsSelected,
                  });
                }}
                labelPlacement="top"
              />
              <FormControlLabel
                sx={{ m: 1 }}
                control={<Checkbox />}
                label="2"
                checked={selected.periods[1]}
                onChange={(event) => {
                  var tempPeriodsSelected = [...selected.periods];
                  tempPeriodsSelected[1] = event.target.checked;
                  setSelected({
                    ...selected,
                    periods: tempPeriodsSelected,
                  });
                }}
                labelPlacement="top"
              />
              <FormControlLabel
                sx={{ m: 1 }}
                control={<Checkbox />}
                label="3"
                checked={selected.periods[2]}
                onChange={(event) => {
                  var tempPeriodsSelected = [...selected.periods];
                  tempPeriodsSelected[2] = event.target.checked;
                  setSelected({
                    ...selected,
                    periods: tempPeriodsSelected,
                  });
                }}
                labelPlacement="top"
              />
              {isWeekend ? (
                <div>
                  <FormControlLabel
                    sx={{ m: 1 }}
                    control={<Checkbox />}
                    label="4"
                    checked={selected.periods[3]}
                    onChange={(event) => {
                      var tempPeriodsSelected = [...selected.periods];
                      tempPeriodsSelected[3] = event.target.checked;
                      setSelected({
                        ...selected,
                        periods: tempPeriodsSelected,
                      });
                    }}
                    labelPlacement="top"
                  />
                  <FormControlLabel
                    sx={{ m: 1 }}
                    control={<Checkbox />}
                    label="5"
                    checked={selected.periods[4]}
                    onChange={(event) => {
                      var tempPeriodsSelected = [...selected.periods];
                      tempPeriodsSelected[4] = event.target.checked;
                      setSelected({
                        ...selected,
                        periods: tempPeriodsSelected,
                      });
                    }}
                    labelPlacement="top"
                  />
                  <FormControlLabel
                    sx={{ m: 1 }}
                    control={<Checkbox />}
                    label="6"
                    checked={selected.periods[5]}
                    onChange={(event) => {
                      var tempPeriodsSelected = [...selected.periods];
                      tempPeriodsSelected[5] = event.target.checked;
                      setSelected({
                        ...selected,
                        periods: tempPeriodsSelected,
                      });
                    }}
                    labelPlacement="top"
                  />
                  <FormControlLabel
                    sx={{ m: 1 }}
                    control={<Checkbox />}
                    label="7"
                    checked={selected.periods[6]}
                    onChange={(event) => {
                      var tempPeriodsSelected = [...selected.periods];
                      tempPeriodsSelected[6] = event.target.checked;
                      setSelected({
                        ...selected,
                        periods: tempPeriodsSelected,
                      });
                    }}
                    labelPlacement="top"
                  />
                  <FormControlLabel
                    sx={{ m: 1 }}
                    control={<Checkbox />}
                    label="8"
                    checked={selected.periods[7]}
                    onChange={(event) => {
                      var tempPeriodsSelected = [...selected.periods];
                      tempPeriodsSelected[7] = event.target.checked;
                      setSelected({
                        ...selected,
                        periods: tempPeriodsSelected,
                      });
                    }}
                    labelPlacement="top"
                  />
                </div>
              ) : null}
            </Grid>
            <Button
              disabled={isDisabled}
              onClick={() => {
                addWorkflow();
              }}
              variant="contained"
              size="small"
              sx={{ m: 1, width: 300 }}
              disableElevation
            >
              예약
            </Button>
            <Button
              disabled={isDisabled}
              size="small"
              sx={{ ml: 1, mr: 1, width: 300 }}
              disableElevation
              onClick={() => {
                setOpenCredentials(true);
              }}
            >
              인증 정보 수정하기
            </Button>
          </Grid>
          <Grid
            container
            item
            direction="column"
            spacing={1}
            sx={{ width: 350 }}
          >
            <h2>예약 확인하기</h2>
            {/* <Reserve key={1} data={} /> */}
            {Object.keys(workflows).map(function (key, _index) {
              return <Reserve flowId={key} data={workflows[key]} key={key} />;
            })}
            {Object.keys(workflows).length === 0 ? (
              <span style={{ color: "#606069" }}>
                아직 예약이 한 건도 없습니다
              </span>
            ) : null}
          </Grid>
        </Grid>
      </Grid>

      <Dialog open={openCredentials} onClose={handleCredentialClose}>
        <DialogTitle>인증 정보 추가/수정</DialogTitle>
        <DialogContent>
          <DialogContentText>
            공식 학생관리시스템(cbshself.kr)의 아이디와 패스워드를 입력해주세요.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="아이디"
            onChange={(e) =>
              setCred({
                ...cred,
                id: e.target.value,
              })
            }
            value={cred.id}
            fullWidth
            variant="standard"
          />
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="패스워드"
            onChange={(e) =>
              setCred({
                ...cred,
                password: e.target.value,
              })
            }
            value={cred.password}
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCredentialClose}>취소</Button>
          <Button onClick={() => handleCredentialClose(true)}>등록</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Workflow;

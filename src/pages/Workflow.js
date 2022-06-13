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
} from "@mui/material";

import { DeleteForever } from "@mui/icons-material";

import { getUserData } from "utils/getUserData";
import IOSSwitch from "utils/IOSSwitch";
import { width } from "@mui/system";

Userfront.init(UserfrontConfig.key);

function Workflow() {
  React.useEffect(() => {
    const init = async () => {
      const userSnap = await getUserData();

      if ("cbshselfCredential" in userSnap) {
        // registered user
        const workflowConfigRef = doc(db, "workflow", "Config");
        const workflowConfigSnap = await getDoc(workflowConfigRef);

        if (workflowConfigSnap.exists()) {
          setTeachersList(Object.keys(workflowConfigSnap.data().teachers));
          setClassesList(Object.keys(workflowConfigSnap.data().classes));

          var tempTeachersList = {};
          Object.keys(workflowConfigSnap.data().teachers).forEach(
            (key, _index) => {
              tempTeachersList[workflowConfigSnap.data().teachers[key]] = key;
            }
          );

          var tempClassesList = {};
          Object.keys(workflowConfigSnap.data().classes).forEach(
            (key, _index) => {
              tempClassesList[workflowConfigSnap.data().classes[key]["id"]] =
                key;
            }
          );
        }

        codeMap.current = {
          teachers: tempTeachersList,
          classes: tempClassesList,
        };
      }

      onSnapshot(doc(db, "workflow", Userfront.user.userUuid), (doc) => {
        if (doc.data() === undefined) {
          setWorkflows([]);
        } else {
          var workflowsObject = doc.data();
          delete workflowsObject.Config;

          setWorkflows(workflowsObject);
        }
      });
    };
    init();
  }, []);

  const teacherName = React.useRef("");
  const className = React.useRef("");

  const codeMap = React.useRef({});

  const [teachersList, setTeachersList] = React.useState([]);
  const [classesList, setClassesList] = React.useState([]);
  const [workflows, setWorkflows] = React.useState([]);

  const [isWeekend, setIsWeekend] = React.useState(false);
  const [selected, setSelected] = React.useState({
    dayOfWeek: [false, false, false, false, false, false, false],
    periods: [false, false, false, false, false, false, false, false],
  });

  function Reserve({ flowId, data }) {
    const classroom = codeMap.current.classes[data.classroomCode];
    const teacher = codeMap.current.teachers[data.conductingTeacherCode];
    const dayOfWeek = "월";
    const periods = "1";
    return (
      <Box
        sx={{ borderRadius: 1, width: 350, height: 175, p: 1 }}
        bgcolor="#ececec"
      >
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
          // onClick={() => deleteReserve(currentId)}
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
        <span>자습 예약 신청 서비스</span>
        <Grid container item direction="row" sx={{ m: 5 }}>
          <Grid
            container
            item
            direction="column"
            spacing={1}
            sx={{ width: 350 }}
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
                <TextField {...params} label="교실" variant="filled" />
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
              // disabled={isDisabled}
              variant="contained"
              size="small"
              sx={{ m: 1, width: 300 }}
              disableElevation
            >
              예약
            </Button>
            <Button
              // disabled={isDisabled}
              // variant="contained"
              size="small"
              sx={{ ml: 1, mr: 1, width: 300 }}
              disableElevation
            >
              로그인 정보 수정하기
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
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}

export default Workflow;

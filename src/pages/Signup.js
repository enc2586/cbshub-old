import * as React from "react";

import userfrontConfig from "auth/userfront.json";

import {
  Stack,
  Button,
  Input,
  FormLabel,
  FormControl,
  FormControlLabel,
  FormHelperText,
  RadioGroup,
  Radio,
  InputLabel,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Userfront from "@userfront/react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { doc, setDoc } from "firebase/firestore";

import { db } from "utils/firebase";

Userfront.init(userfrontConfig.key);

const SignUp = () => {
  React.useEffect(() => {
    nameRef.current.focus();
  }, []);

  const [values, setValues] = React.useState({
    name: "",
    sid: "",
    sex: null,
    email: "",
    username: "",
    password: "",
    passwordRepeat: "",
    nameError: {
      status: false,
      message: null,
    },
    sidError: {
      status: false,
      message: "0학년 0반 0번 (잘못됨)",
    },
    sexError: {
      status: false,
      message: null,
    },
    emailError: {
      status: false,
      message: null,
    },
    usernameError: {
      status: false,
      message: null,
    },
    passwordError: {
      status: false,
      message: null,
    },
    passwordRepeatError: {
      status: false,
      message: null,
    },
    showPassword: false,
    areLocked: false,
  });

  const handleChange = (prop) => (event) => {
    if (prop == "sid") {
      if (event.target.value.length <= 4) {
        const onlyNums = event.target.value.replace(/[^0-9]/g, "");
        const sidInfo = sidMgmt(onlyNums);
        setValues({
          ...values,
          [prop]: onlyNums,
          [prop + "Error"]: {
            status: false,
            message: sidInfo.validity
              ? sidInfo.grade +
                "학년 " +
                sidInfo.class +
                "반 " +
                sidInfo.number +
                "번 (올바름)"
              : sidInfo.grade +
                "학년 " +
                sidInfo.class +
                "반 " +
                sidInfo.number +
                "번 (잘못됨)",
          },
        });
      }
    } else if (prop == "email" || prop == "username" || prop == "name") {
      const noSpaces = event.target.value.replace(/[ ]/g, "");
      setValues({
        ...values,
        [prop]: noSpaces,
        [prop + "Error"]: {
          status: false,
          message: null,
        },
      });
    } else if (prop == "password") {
      setValues({
        ...values,
        password: event.target.value,
        passwordError: {
          status: false,
          message: null,
        },
        passwordRepeatError: {
          status: false,
          message: null,
        },
      });
    } else {
      setValues({
        ...values,
        [prop]: event.target.value,
        [prop + "Error"]: {
          status: false,
          message: null,
        },
      });
    }
  };

  const handleClickShowPassword = () => {
    setValues({
      ...values,
      showPassword: !values.showPassword,
    });
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const nameRef = React.useRef(null);
  const sidRef = React.useRef(null);
  const emailRef = React.useRef(null);
  const usernameRef = React.useRef(null);
  const passwordRef = React.useRef(null);
  const passwordRepeatRef = React.useRef(null);

  const sidMgmt = (enteredSid) => {
    if (enteredSid == 0) {
      return {
        grade: 0,
        class: 0,
        number: 0,
        validity: false,
      };
    }

    let validity = true;
    let sid = enteredSid;

    if (sid < 1000) {
      while (sid < 1000) {
        sid *= 10;
      }

      validity = false;
    }

    let sidInfo = {
      grade: parseInt(sid / 1000),
      class: parseInt(sid / 100) % 10,
      number: sid % 100,
    };

    if (sidInfo.grade > 3 || sidInfo.grade < 1) validity = false;
    if (sidInfo.class > 5 || sidInfo.class < 1) validity = false;
    if (sidInfo.number > 20 || sidInfo.class < 1) validity = false;

    sidInfo.validity = validity;

    return sidInfo;
  };

  const signup = async () => {
    console.log(values.sex);
    setValues({
      ...values,
      areLocked: true,
    });

    if (values.name == "") {
      setValues({
        ...values,
        nameError: {
          status: true,
          message: "비어 있어요",
        },
        areLocked: false,
      });
      nameRef.current.focus();
      return;
    } else if (values.sid == "") {
      setValues({
        ...values,
        sidError: {
          status: true,
          message: "비어 있어요",
        },
        areLocked: false,
      });
      sidRef.current.focus();
      return;
    } else if (!sidMgmt(values.sid).validity) {
      setValues({
        ...values,
        sidError: {
          status: true,
          message: "올바르지 않은 형식이에요",
        },
        areLocked: false,
      });
      sidRef.current.focus();
      return;
    } else if (values.sex == null) {
      setValues({
        ...values,
        sexError: {
          status: true,
          message: "선택해 주세요",
        },
        areLocked: false,
      });
      emailRef.current.focus();
      return;
    } else if (values.email == "") {
      setValues({
        ...values,
        emailError: {
          status: true,
          message: "비어 있어요",
        },
        areLocked: false,
      });
      emailRef.current.focus();
      return;
    } else if (
      values.email.lastIndexOf("@") == -1 ||
      values.email.lastIndexOf(".") == -1 ||
      values.email.lastIndexOf(".") - values.email.lastIndexOf("@") <= 1 ||
      values.email.lastIndexOf(".") + 1 == values.email.length ||
      values.email.lastIndexOf("@") == 0
    ) {
      setValues({
        ...values,
        emailError: {
          status: true,
          message: "올바르지 않은 형식이에요",
        },
        areLocked: false,
      });
      emailRef.current.focus();
      return;
    } else if (values.username == "") {
      setValues({
        ...values,
        usernameError: {
          status: true,
          message: "비어 있어요",
        },
        areLocked: false,
      });
      usernameRef.current.focus();
      return;
    } else if (values.password == "") {
      setValues({
        ...values,
        passwordError: {
          status: true,
          message: "비어 있어요",
        },
        areLocked: false,
      });
      passwordRef.current.focus();
      return;
    } else if (values.passwordRepeat == "") {
      setValues({
        ...values,
        passwordRepeatError: {
          status: true,
          message: "비어 있어요",
        },
        areLocked: false,
      });
      passwordRepeatRef.current.focus();
      return;
    } else if (values.password != values.passwordRepeat) {
      setValues({
        ...values,
        passwordRepeatError: {
          status: true,
          message: "비밀번호가 같지 않아요",
        },
        areLocked: false,
      });
      passwordRepeatRef.current.focus();
      return;
    } else if (!isNaN(values.password) && values.password.length < 16) {
      setValues({
        ...values,
        passwordError: {
          status: true,
          message: "숫자만 있는 비밀번호는 최소 16자리에요",
        },
        areLocked: false,
      });
      passwordRepeatRef.current.focus();
      return;
    } else if (isNaN(values.password) && values.password.length < 8) {
      setValues({
        ...values,
        passwordError: {
          status: true,
          message: "숫자+문자 조합의 비밀번호는 최소 8자리에요",
        },
        areLocked: false,
      });
      passwordRepeatRef.current.focus();
      return;
    }

    try {
      await Userfront.signup({
        method: "password",
        name: values.name,
        email: values.email,
        password: values.password,
        username: values.username,
        redirect: false,
      });

      const sidInfo = sidMgmt(values.sid);

      await setDoc(doc(db, "users", Userfront.user.userUuid), {
        class: Number(sidInfo.class),
        grade: Number(sidInfo.grade),
        number: Number(sidInfo.number),
        email: values.email,
        name: values.name,
        sex: values.sex,
        username: values.username,
        rfid: "",
        dodoco: doc(db, "dodoco", "00000000000000000000"),
      });

      toast.success("가입을 환영합니다, " + values.name + " 님!", {
        toastId: "WelcomeAfterSignUp",
      });
      toast.info("가입한 정보로 로그인했습니다.", {
        toastId: "loggedInAfterSignUp",
      });
      navigate("/");
    } catch (err) {
      handleError(err);
    }
  };

  const handleError = (err) => {
    if (err == "Error: Email exists") {
      setValues({
        ...values,
        emailError: {
          status: true,
          message: "이미 사용중인 이메일이에요",
        },
        areLocked: false,
      });
    } else if (err == "Error: Email format is invalid") {
      setValues({
        ...values,
        emailError: {
          status: true,
          message: "올바르지 않은 형식이에요",
        },
        areLocked: false,
      });
    } else if (err == "Error: Username exists") {
      setValues({
        ...values,
        usernameError: {
          status: true,
          message: "이미 사용중인 아이디에요",
        },
        areLocked: false,
      });
    } else if (
      err ==
      "Error: Password must be at least 16 characters OR at least 8 characters including a number and a letter"
    ) {
      setValues({
        ...values,
        passwordError: {
          status: true,
          message: "영어, 숫자, 일부 특수문자만 사용할 수 있어요",
        },
        areLocked: false,
      });
    } else {
      setValues({
        ...values,
        areLocked: false,
      });
      console.error(err);
      toast.error("예상하지 못한 오류가 일어났어요.", {
        toastId: "unknownError",
      });
      toast.error("예상하지 못한 오류가 일어났어요.", {
        toastId: "unknownError",
      });
      toast.info("새로고침하면 해결될 수도 있어요!", { toastId: "tryRefresh" });
    }
  };

  let navigate = useNavigate();
  return (
    <div>
      <h1>Sign Up</h1>
      <h3>회원가입을 환영합니다.</h3>
      <Stack spacing={1} direction="column">
        <Stack spacing={1} direction="row" sx={{ width: "30ch" }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sidRef.current.focus();
            }}
          >
            <FormControl variant="standard" disabled={values.areLocked}>
              <InputLabel
                htmlFor="standard-name"
                error={values.nameError.status}
              >
                이름
              </InputLabel>
              <Input
                id="standard-name"
                error={values.nameError.status}
                inputRef={nameRef}
                value={values.name}
                onChange={handleChange("name")}
                aria-describedby="name-error-text"
              />
              <FormHelperText
                id="name-error-text"
                error={values.nameError.status}
              >
                {values.nameError.message}
              </FormHelperText>
            </FormControl>
          </form>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              emailRef.current.focus();
            }}
          >
            <FormControl variant="standard" disabled={values.areLocked}>
              <InputLabel htmlFor="standard-sid" error={values.sidError.status}>
                학번
              </InputLabel>
              <Input
                id="standard-sid"
                error={values.sidError.status}
                inputRef={sidRef}
                value={values.sid}
                onChange={handleChange("sid")}
                aria-describedby="sid-error-text"
              />
              <FormHelperText
                id="sid-error-text"
                error={values.sidError.status}
              >
                {values.sidError.message}
              </FormHelperText>
            </FormControl>
          </form>
        </Stack>

        <FormControl error={values.sexError.status}>
          <FormLabel id="demo-controlled-radio-buttons-group">성별</FormLabel>
          <RadioGroup
            row
            aria-labelledby="demo-controlled-radio-buttons-group"
            name="controlled-radio-buttons-group"
            value={values.sex}
            onChange={handleChange("sex")}
          >
            <FormControlLabel value={true} control={<Radio />} label="남성" />
            <FormControlLabel value={false} control={<Radio />} label="여성" />
          </RadioGroup>
          <FormHelperText>{values.sexError.message}</FormHelperText>
        </FormControl>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            usernameRef.current.focus();
          }}
        >
          <FormControl variant="standard" disabled={values.areLocked}>
            <InputLabel
              htmlFor="standard-name"
              error={values.emailError.status}
            >
              이메일
            </InputLabel>
            <Input
              sx={{ width: "30ch" }}
              id="standard-email"
              error={values.emailError.status}
              inputRef={emailRef}
              value={values.email}
              onChange={handleChange("email")}
              aria-describedby="email-error-text"
            />
            <FormHelperText
              id="email-error-text"
              error={values.emailError.status}
            >
              {values.emailError.message}
            </FormHelperText>
          </FormControl>
        </form>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            passwordRef.current.focus();
          }}
        >
          <FormControl variant="standard" disabled={values.areLocked}>
            <InputLabel
              htmlFor="standard-username"
              error={values.usernameError.status}
            >
              아이디
            </InputLabel>
            <Input
              sx={{ width: "30ch" }}
              id="standard-username"
              error={values.usernameError.status}
              inputRef={usernameRef}
              value={values.username}
              onChange={handleChange("username")}
              aria-describedby="username-error-text"
            />
            <FormHelperText
              id="uesrname-error-text"
              error={values.usernameError.status}
            >
              {values.usernameError.message}
            </FormHelperText>
          </FormControl>
        </form>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            passwordRepeatRef.current.focus();
          }}
        >
          <FormControl
            sx={{ width: "30ch" }}
            variant="standard"
            disabled={values.areLocked}
          >
            <InputLabel
              htmlFor="standard-adornment-password"
              error={values.passwordError.status}
            >
              비밀번호
            </InputLabel>
            <Input
              id="standard-adornment-password"
              error={values.passwordError.status}
              inputRef={passwordRef}
              type={
                values.showPassword && !values.areLocked ? "text" : "password"
              }
              value={values.password}
              onChange={handleChange("password")}
              aria-describedby="password-error-text"
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    disabled={values.areLocked}
                  >
                    {values.showPassword && !values.areLocked ? (
                      <VisibilityOff />
                    ) : (
                      <Visibility />
                    )}
                  </IconButton>
                </InputAdornment>
              }
            />
            <FormHelperText
              id="password-error-text"
              error={values.passwordError.status}
            >
              {values.passwordError.message}
            </FormHelperText>
          </FormControl>
        </form>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            signup();
          }}
        >
          <FormControl
            sx={{ width: "30ch" }}
            variant="standard"
            disabled={values.areLocked}
          >
            <InputLabel
              htmlFor="standard-adornment-passwordRepeat"
              error={values.passwordRepeatError.status}
            >
              비밀번호 확인
            </InputLabel>
            <Input
              id="standard-adornment-passwordRepeat"
              error={values.passwordRepeatError.status}
              inputRef={passwordRepeatRef}
              type={
                values.showPassword && !values.areLocked ? "text" : "password"
              }
              value={values.passwordRepeat}
              onChange={handleChange("passwordRepeat")}
              aria-describedby="passwordRepeat-error-text"
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    disabled={values.areLocked}
                  >
                    {values.showPassword && !values.areLocked ? (
                      <VisibilityOff />
                    ) : (
                      <Visibility />
                    )}
                  </IconButton>
                </InputAdornment>
              }
            />
            <FormHelperText
              id="passwordRepeat-error-text"
              error={values.passwordRepeatError.status}
            >
              {values.passwordRepeatError.message}
            </FormHelperText>
          </FormControl>
        </form>
        <Button
          variant="contained"
          size="large"
          disabled={values.areLocked}
          disableElevation
          onClick={() => signup()}
        >
          회원가입
        </Button>
      </Stack>
    </div>
  );
};

export default SignUp;

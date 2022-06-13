import * as React from "react";

import userfrontConfig from "auth/userfront.json";

import {
  Stack,
  Button,
  Input,
  FormControl,
  FormHelperText,
  InputLabel,
  InputAdornment,
  IconButton,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Userfront from "@userfront/react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

Userfront.init(userfrontConfig.key);

const Home = () => {
  React.useEffect(() => {
    usernameInputRef.current.focus();
  }, []);

  let navigate = useNavigate();

  const [values, setValues] = React.useState({
    username: "",
    password: "",
    usernameError: {
      status: false,
      message: null,
    },
    passwordError: {
      status: false,
      message: null,
    },
    showPassword: false,
    areLocked: false,
  });

  React.useEffect(() => {
    setValues({
      ...values,
      usernameError: {
        status: false,
        message: null,
      },
      passwordError: {
        status: false,
        message: null,
      },
    });
  }, [values.username]);

  React.useEffect(() => {
    setValues({
      ...values,
      usernameError: {
        status: false,
        message: null,
      },
      passwordError: {
        status: false,
        message: null,
      },
    });
  }, [values.password]);

  const handleChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value });
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

  const handleError = (err) => {
    if (err == `Error: "password" is not allowed to be empty`) {
      setValues({
        ...values,
        areLocked: false,
        passwordError: {
          status: true,
          message: "비어 있어요",
        },
      });
      passwordInputRef.current.focus();
    } else if (err == `Error: "emailOrUsername" is required`) {
      setValues({
        ...values,
        areLocked: false,
        usernameError: {
          status: true,
          message: "비어 있어요",
        },
      });
      usernameInputRef.current.focus();
    } else if (err == `Error: Incorrect username or password`) {
      setValues({
        ...values,
        areLocked: false,
        usernameError: {
          status: true,
          message: null,
        },
        passwordError: {
          status: true,
          message: "정보가 올바르지 않아요",
        },
      });
      passwordInputRef.current.focus();
    } else {
      console.error(err);
      toast.error("예상하지 못한 오류가 일어났어요.");
    }
  };

  const usernameInputRef = React.useRef(null);
  const passwordInputRef = React.useRef(null);

  const signIn = async () => {
    setValues({
      ...values,
      areLocked: true,
    });

    try {
      await Userfront.login({
        method: "password",
        username: values.username,
        password: values.password,
        redirect: false,
      });
      toast.success("성공적으로 로그인했어요.");
      navigate("/");
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <h3>로그인 페이지입니다.</h3>
      <Stack spacing={2} direction="column">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            passwordInputRef.current.focus();
          }}
        >
          <FormControl
            sx={{ width: "25ch" }}
            variant="standard"
            disabled={values.areLocked}
          >
            <InputLabel
              htmlFor="standard-username"
              error={values.usernameError.status}
            >
              아이디
            </InputLabel>
            <Input
              id="standard-username"
              error={values.usernameError.status}
              inputRef={usernameInputRef}
              value={values.username}
              onChange={handleChange("username")}
              aria-describedby="username-error-text"
            />
            <FormHelperText
              id="username-error-text"
              error={values.usernameError.status}
            >
              {values.usernameError.message}
            </FormHelperText>
          </FormControl>
        </form>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            signIn();
          }}
        >
          <FormControl
            sx={{ width: "25ch" }}
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
              inputRef={passwordInputRef}
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
        <Stack spacing={3} direction="column">
          <Button
            variant="contained"
            size="large"
            endIcon={<LoginIcon />}
            disabled={values.areLocked}
            disableElevation
            onClick={() => signIn()}
          >
            로그인
          </Button>
          <Stack direction="column">
            <Button
              variant="text"
              size="medium"
              disableElevation
              onClick={() => navigate("/signup")}
            >
              가입하기
            </Button>
            <Button
              variant="text"
              size="medium"
              disableElevation
              onClick={() => navigate("/passwordReset")}
            >
              비밀번호 분실/변경
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </div>
  );
};

export default Home;

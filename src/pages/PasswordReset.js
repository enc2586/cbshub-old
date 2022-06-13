import * as React from "react";

import { Stack } from "@mui/material";
import userfrontConfig from "auth/userfront.json";
import Userfront from "@userfront/react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

Userfront.init(userfrontConfig.key);

const PasswordResetForm = Userfront.build({
  toolId: userfrontConfig.passwordReset,
});

const PasswordReset = () => {
  return (
    <div>
      <div style={{ height: "100px" }} />
      <Stack spacing={2} direction="column">
        <PasswordResetForm />
      </Stack>
    </div>
  );
};

export default PasswordReset;

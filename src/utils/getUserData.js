import * as React from "react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";
import { db } from "utils/firebase";

import Userfront from "@userfront/core";
import UserfrontConfig from "auth/userfront.json";

import { toast } from "react-toastify";

Userfront.init(UserfrontConfig.key);

const userRef = (uid = Userfront.user.userUuid) => {
  return doc(db, "users", uid);
};

const getUserData = async (uid = Userfront.user.userUuid) => {
  const userSnap = await getDoc(userRef(uid));

  if (userSnap.exists()) {
    return userSnap.data();
  } else {
    toast.error(
      <div>
        심각한 오류가 일어났어요.
        <br />
        반복된다면 관리자에게 문의해주세요.
      </div>,
      { toastId: "noUserData" }
    );
    console.error(
      "사용자 [" +
        Userfront.user.userUuid +
        "] 의 프로필은 존재하지만, 데이터는 존재하지 않습니다."
    );
    throw (
      "사용자 [" +
      Userfront.user.userUuid +
      "] 의 프로필은 존재하지만, 데이터는 존재하지 않습니다."
    );
  }
};

export { userRef, getUserData };

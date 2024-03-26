import {
  COLLECTION_ID_MESSAGES,
  DATABASE_ID,
  account,
  databases,
} from "../../appwriteConfig";
import { ID, Query } from "appwrite";
import { proxy } from "valtio";

export const Store = proxy({
  loading: false,
  logoutLoading: false,
  user: null,
  roomId: null,

  setUser: (newUser) => (Store.user = newUser),
  getUserOnLoad: async () => {
    try {
      let accountDetails = await account.get();

      // console.log("account details", accountDetails);
      Store.setUser(accountDetails);
      return accountDetails;
    } catch (error) {
      console.log(`error while getting the user`, error);
    }
  },

  handleUserLogin: async (e, credentials) => {
    e.preventDefault();
    console.log("CREDS:", credentials);
    Store.loading = true;
    console.log("login function runs");

    try {
      await account.createEmailSession(credentials.email, credentials.password);
      let accountDetails = await Store.getUserOnLoad();

      localStorage.setItem("token", accountDetails.$id);

      console.log(accountDetails);
    } catch (error) {
      console.error("error in the login function", error);
    } finally {
      Store.loading = false;
    }
  },

  getMessages: async () => {
    try {
      Store.loading = true;
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID_MESSAGES,
        [
          Query.orderDesc(`$createdAt`),
          Query.limit(100),
          Query.equal("room_id", Store.roomId),
        ]
      );
      // console.log("document list", response);
      // setMessages(response.documents);

      return response;
    } catch (error) {
      console.log(`Error while getting the messages`, error);
    } finally {
      Store.loading = false;
    }
  },

  handleLogout: async () => {
    try {
      Store.logoutLoading = true;
      await account.deleteSession("current");
      Store.setUser(null);
      localStorage.removeItem("token");
      console.log("Logout Successfully");
    } catch (error) {
      console.log("error in the logout function", error);
    } finally {
      Store.logoutLoading = false;
    }
  },

  handleRegister: async (e, credentials) => {
    e.preventDefault();
    console.log("Handle Register triggered!", credentials);

    if (credentials.password1 !== credentials.password2) {
      alert("Passwords did not match!");
      return;
    }

    Store.loading = true;

    try {
      let response = await account.create(
        ID.unique(),
        credentials.email,
        credentials.password1,
        credentials.name
      );
      console.log("User registered!", response);

      if (response) {
        Store.loading = false;
      }
    } catch (error) {
      console.error(error);
    }
  },
});

import { account } from "../appwriteConfig";
import { ID } from "appwrite";
import { proxy } from "valtio";

export const Store = proxy({
  loading: false,
  setLoading: (booleanValue) => (Store.loading = booleanValue),
  user: null,
  setUser: (newUser) => (Store.user = newUser),
  getUserOnLoad: async () => {
    try {
      let accountDetails = await account.get();
      Store.setUser(accountDetails);
      return accountDetails;
    } catch (error) {
      console.log(`error while getting the user`, error);
    }
    // Store.loading = false;
  },

  handleUserLogin: async (e, credentials) => {
    e.preventDefault();
    console.log("CREDS:", credentials);
    Store.loading = true;

    try {
      await account.createEmailSession(credentials.email, credentials.password);
      let accountDetails = await Store.getUserOnLoad();
      Store.setUser(accountDetails);
      localStorage.setItem("token", accountDetails.$id);
    } catch (error) {
      console.error("error in the login function", error);
    }

    // Store.loading = false;
  },

  handleLogout: async () => {
    try {
      await account.deleteSession("current");
      Store.setUser(null);
      localStorage.removeItem("token");
      Store.loading = false;
      console.log("Logout Successfully");
    } catch (error) {
      console.log("error in the logout function", error);
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

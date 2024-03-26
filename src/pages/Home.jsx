import { useCallback, useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Dialog, DialogHeader } from "../components/ui/dialog";
import {
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import {
  DATABASE_ID,
  COLLECTION_ID_CHATBOX,
  databases,
} from "../appwriteConfig";
import { ID, Query } from "appwrite";
import { useNavigate } from "react-router-dom";
import { Store } from "../lib/utils/Store";
import { useSnapshot } from "valtio";

export default function Home() {
  const [chatname, setChatName] = useState("");
  const [open, setOpen] = useState(false);
  const [chatlist, setChatList] = useState([]);

  const navigate = useNavigate();
  const State = useSnapshot(Store);

  const getChats = useCallback(async () => {
    try {
      Store.loading = true;

      const res = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID_CHATBOX,
        [(Query.orderDesc(`$createdAt`), Query.limit(100))]
      );

      if (res) {
        console.log("list of the documents", res);

        setChatList(res.documents);
      }
    } catch (error) {
      console.log(`error while listing the chats`);
    } finally {
      Store.loading = false;
    }
  }, []);

  useEffect(() => {
    getChats();

    console.log("use effect runs");
  }, [getChats]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submit");

    const payload = {
      name: chatname.length > 5 ? chatname : null,
      id: ID.unique(),
    };

    try {
      const res = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID_CHATBOX,
        ID.unique(),
        payload
      );
      console.log("chat room created", res);
      getChats();
    } catch (error) {
      console.log(`error while creating the room`, error);
    } finally {
      setOpen(false);
    }
  };

  const LogoutHandler = async () => {
    try {
      Store.logoutLoading = true;
      await Store.handleLogout();
      navigate("/login");
    } catch (error) {
      console.log(`error while logging out from the home ${error}`);
    } finally {
      Store.logoutLoading = false;
    }
  };

  const navigateToRoom = (roomId, roomName) => {
    navigate(`/room/${roomId}`, {
      state: {
        name: roomName,
      },
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Room</DialogTitle>
            <DialogDescription>Create a new room</DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <form
                onSubmit={(e) => handleSubmit(e)}
                className="flex flex-col gap-2"
              >
                <Input
                  value={chatname}
                  placeholder="Enter room name"
                  onChange={(e) => setChatName(e.target.value)}
                />
                <Button variant="outline">Submit</Button>
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <div className="flex flex-col w-full min-h-screen">
        <header className="flex items-center justify-between p-4 border-b border-gray-200 sm:p-6 dark:border-gray-800">
          <div className="space-y-1 text-lg font-semibold">Chat Rooms</div>
          <div className="flex gap-6">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setOpen((prevState) => !prevState)}
            >
              New Room
            </Button>

            <Button size="sm" variant="primary" onClick={LogoutHandler}>
              Log Out
            </Button>
          </div>
        </header>

        <main className="flex-1">
          {State.loading && !State.logoutLoading && (
            <div className="text-center"> Loading... </div>
          )}
          {!State.loading && State.logoutLoading && (
            <div className="text-center"> Logging Out... </div>
          )}

          <div className="container grid gap-4 p-4 grid-cols-3 text-center xl:max-w-5xl xl:mx-auto">
            {chatlist.map((chat, index) => {
              return (
                <div
                  key={index}
                  className="flex flex-col gap-2 rounded-lg border-2 dark:border-gray-500 h-[150px] items-center justify-center cursor-pointer"
                  onClick={() => navigateToRoom(chat.$id, chat.name)}
                >
                  <div className="flex items-center text-center flex-col p-4 space-y-2">
                    <h3 className="text-2xl font-semibold">{chat.name}</h3>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </>
  );
}

import { useState, useEffect, useRef } from "react";

import client, {
  databases,
  DATABASE_ID,
  COLLECTION_ID_MESSAGES,

  // account,
} from "../appwriteConfig";
import { ID, Permission, /* Query  Permission, Role */ Role } from "appwrite";
import Header from "../components/Header";
import { Trash2, Edit2 } from "react-feather";
import { Store } from "../lib/utils/Store";
import { useSnapshot } from "valtio";
import { Button } from "../components/ui/button";
import { Link, useLocation, useParams } from "react-router-dom";

const Room = () => {
  const [messageBody, setMessageBody] = useState("");
  const [messages, setMessages] = useState([]);
  const [updatemode, setUpdateMode] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState(null);

  const State = useSnapshot(Store);
  const textRef = useRef(null);
  const { id } = useParams();

  const location = useLocation();
  const roomName = location && location?.state?.name;

  useEffect(() => {
    console.log("room use effect working");

    Store.roomId = id;

    async function getUser() {
      try {
        await Store.getUserOnLoad();
      } catch (error) {
        console.log("error while getting the user in room component", error);
      }
    }

    getUser();

    async function fetchData() {
      try {
        const res = await Store.getMessages();

        console.log("messages list", res);

        setMessages(res.documents);
      } catch (error) {
        console.log(`error in the fetch data function`);
      }
    }

    fetchData();

    textRef.current.focus();

    const unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${COLLECTION_ID_MESSAGES}.documents`,
      (response) => {
        console.log("response", response);

        console.log("inside");

        if (
          response.events.includes(
            "databases.*.collections.*.documents.*.create"
          )
        ) {
          console.log("response", response);

          console.log("A MESSAGE WAS CREATED");
          setMessages((prevState) => [response.payload, ...prevState]);
        }

        if (
          response.events.includes(
            "databases.*.collections.*.documents.*.delete"
          )
        ) {
          console.log("A MESSAGE WAS DELETED!!!");

          console.log(response.payload); //? response.payload is the updated object

          setMessages((prevState) =>
            prevState.filter((message) => message.$id !== response.payload.$id)
          );
        }

        if (
          response.events.includes(
            "databases.*.collections.*.documents.*.update"
          )
        ) {
          console.log("A MESSAGE WAS UPDATED!!!");
          console.log(
            response.payload
          ); /*? response.payload is the updated object */
          setMessages((prevState) =>
            prevState.map((message) => {
              console.log("Current Message:", message);
              return message.$id === response.payload.$id
                ? { ...message, ...response.payload }
                : message;
            })
          );
        }
      }
    );

    console.log("unsubscribe:", unsubscribe);

    return () => {
      unsubscribe();
      console.log("unsubscribed");
    };
  }, [id]);

  // const location = useLocation();
  // const roomName = location && location.state;

  // console.log(roomName);

  // const getMessages = useCallback(async () => {
  //   try {
  //     Store.loading = true;
  //     const response = await databases.listDocuments(
  //       DATABASE_ID,
  //       COLLECTION_ID_MESSAGES,
  //       [
  //         Query.orderDesc(`$createdAt`),
  //         Query.limit(100),
  //         Query.equal("room_id", roomId),
  //       ]
  //     );
  //     // console.log("document list", response);
  //     setMessages(response.documents);
  //   } catch (error) {
  //     console.log(`Error while getting the messages`, error);
  //   } finally {
  //     Store.loading = false;
  //   }
  // }, [roomId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const permissions = [Permission.write(Role.user(Store.user.$id))];

    const payload = {
      user_id: Store.user.$id,
      username: Store.user.name,
      body: messageBody,
      room_id: State.roomId,
    };

    if (!updatemode) {
      await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID_MESSAGES,
        ID.unique(),
        payload,
        permissions
      );

      console.log("document creation function runs");

      Store.getMessages();
      setMessageBody("");

      // console.log("RESPONSE:", response);
    } else {
      const res = await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID_MESSAGES,
        selectedMessageId,
        payload
      );

      console.log("updated successfully", res);

      setMessageBody("");
      setUpdateMode(false);
      setSelectedMessageId(null);
      Store.getMessages();
    }
  };

  const deleteMessage = async (id) => {
    await databases.deleteDocument(DATABASE_ID, COLLECTION_ID_MESSAGES, id);
    Store.getMessages();
  };

  const editMessage = (message) => {
    setMessageBody(message.body);
    setUpdateMode(true);
    setSelectedMessageId(message.$id);
  };

  // console.log(State.user);

  return (
    <>
      {State.loading && !State.logoutLoading && (
        <div className="text-center"> Loading... </div>
      )}
      {!State.loading && State.logoutLoading && (
        <div className="text-center"> Logging Out... </div>
      )}

      <main className="container space-y-5">
        <Link to="/">
          <Button variant="secondary">Back To Chats</Button>
        </Link>

        <Header state={roomName} />
        <div className="room--container">
          <form id="message--form" onSubmit={handleSubmit}>
            <div>
              <textarea
                required
                maxLength="250"
                placeholder="Say something..."
                onChange={(e) => setMessageBody(e.target.value)}
                value={messageBody}
                ref={textRef}
              ></textarea>
            </div>
            <div className="send-btn--wrapper">
              <input
                className="btn btn--secondary"
                type="submit"
                value={`${updatemode ? "update" : "send"}`}
              />
            </div>
          </form>

          <div>
            {messages.map((message) => (
              <div key={message.$id} className={"message--wrapper"}>
                <div
                  className={` flex ${
                    message.user_id === Store.user?.$id &&
                    "justify-end items-center"
                  }`}
                >
                  {message.$permissions.includes(
                    `delete("user:${Store.user?.$id}")`
                  ) && (
                    <Trash2
                      className="text-[#8db3dd] hover:text-[#7ba3cf] cursor-pointer transition-all mr-6"
                      onClick={() => deleteMessage(message.$id)}
                    />
                  )}

                  {message.$permissions.includes(
                    `update("user:${Store.user?.$id}")`
                  ) && (
                    <Edit2
                      className="text-[#8db3dd] hover:text-[#7ba3cf] cursor-pointer transition-all mr-6"
                      onClick={() => editMessage(message)}
                    />
                  )}

                  <div
                    className={
                      "message--body  " +
                      (message.user_id === Store.user?.$id
                        ? "border-2 border-pink-600"
                        : "bg-pink-600")
                    }
                  >
                    <span>{message.body}</span>
                  </div>
                </div>
                <div
                  className={`message--header ${
                    message.user_id === Store.user?.$id ? "justify-end" : ""
                  } `}
                >
                  <p>
                    {message?.username ? (
                      <span> {message?.username}</span>
                    ) : (
                      "Anonymous user"
                    )}

                    <small className="message-timestamp">
                      {new Date(message.$createdAt).toLocaleString()}
                    </small>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default Room;

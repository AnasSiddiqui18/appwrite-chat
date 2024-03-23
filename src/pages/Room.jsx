import { useState, useEffect, useRef } from "react";

import client, {
  databases,
  DATABASE_ID,
  COLLECTION_ID_MESSAGES,

  // account,
} from "../appwriteConfig";
import { ID, Permission, Query /* Permission, Role */, Role } from "appwrite";
import Header from "../components/Header";
// import { useAuth } from "../utils/Store";
import { Trash2, Edit2 } from "react-feather";
// import { useSnapshot } from "valtio";
import { Store } from "../utils/Store";

const Room = () => {
  const [messageBody, setMessageBody] = useState("");
  const [messages, setMessages] = useState([]);
  const [updatemode, setUpdateMode] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState(null);

  // const { user, setUser } = useAuth();

  const textRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      console.log("token", token);
      let accountDetails = Store.getUserOnLoad();
      if (accountDetails) {
        Store.setUser(accountDetails);
      } else {
        console.log("error while getting the account details");
      }
    }

    console.log("use effect runs");

    getMessages();

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

          console.log(response.payload); //? response.payload is the updated object

          setMessages((prevState) =>
            prevState.map((message) => {
              console.log("Current Message:", message); // Log each message
              return message.$id === response.payload.$id
                ? { ...message, ...response.payload }
                : message;
            })
          );
        }
      }
    );

    // console.log("unsubscribe:", unsubscribe);

    return () => unsubscribe();
  }, []);

  const getMessages = async () => {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID_MESSAGES,
      [Query.orderDesc(`$createdAt`), Query.limit(100)]
    );

    console.log("document list", response);

    setMessages(response.documents);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const permissions = [Permission.write(Role.user(Store.user.$id))];

    const payload = {
      user_id: Store.user.$id,
      username: Store.user.name,
      body: messageBody,
    };

    if (!updatemode) {
      const response = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID_MESSAGES,
        ID.unique(),
        payload,
        permissions
      );

      getMessages();
      setMessageBody("");

      console.log("RESPONSE:", response);
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
      getMessages();
    }
  };

  const deleteMessage = async (id) => {
    await databases.deleteDocument(DATABASE_ID, COLLECTION_ID_MESSAGES, id);
  };

  const editMessage = (message) => {
    setMessageBody(message.body);
    setUpdateMode(true);
    setSelectedMessageId(message.$id);
  };

  // const obj1 = {
  //   name: "sam",
  //   id: 23,
  //   grade: 2,
  //   skills: "devops",
  // };

  // const obj2 = {
  //   skills: "backend",
  // };

  // const myObj = { ...obj1, ...obj2 };
  // console.log(myObj);

  return (
    <main className="container">
      <Header />
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
                  message.user_id === Store.user.$id ? "justify-end" : ""
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
  );
};

export default Room;

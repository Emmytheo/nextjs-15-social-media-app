import { StreamChat } from "stream-chat";

const streamServerClient = StreamChat.getInstance(
  process.env.NEXT_PUBLIC_STREAM_KEY!,
  process.env.STREAM_SECRET,
  {
    timeout: 10000, // 10 seconds timeout instead of default 3 seconds
  }
);

export default streamServerClient;

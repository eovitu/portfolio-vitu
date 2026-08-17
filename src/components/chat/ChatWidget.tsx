import { ChatPanel } from './ChatPanel';

interface Props {
  open: boolean;
  onClose: () => void;
}

/** Mounts the GET TO KNOW ME panel. State lives in `hooks/useChat`. */
export function ChatWidget({ open, onClose }: Props) {
  return <ChatPanel open={open} onClose={onClose} />;
}

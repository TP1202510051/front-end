import { useParams } from 'react-router';

const ChatInterface = () => {
  const { projectId } = useParams<{ projectId: string }>();
  return (
    <div>
      <span> {projectId} </span>
    </div>
  );
};

export default ChatInterface;

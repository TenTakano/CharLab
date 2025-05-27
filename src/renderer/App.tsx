import { FC } from "react";
import noImage from "./assets/noimage.svg";

const App: FC = () => {
  return (
    <div>
      <h1>Welcome to the App</h1>
      <p>This is a simple React application.</p>
      <img src={noImage} />
    </div>
  );
};

export default App;

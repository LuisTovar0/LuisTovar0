import React, {useState} from 'react';
import './App.css';
import infos, {Ref} from "../infos";

type Elem = JSX.Element;

export default function App() {

  const refToLi = (ref: Ref) => <li><a href={ref.url}>{ref.name}</a></li>;
  const workLinks = infos.work.map(refToLi);
  const coolLinks = infos.cool.map(refToLi);
  const musicLinks = infos.music.map(refToLi);

  const [list, listSetter] = useState(workLinks);
  const buttons = [[workLinks, "Work"], [coolLinks, "Recommendations"], [musicLinks, "Music"]]
    .map(([l, n]) => (<button onClick={() => listSetter(l as Elem[])}>{n}</button>));

  return (
    <div className="App">
      <div className="buttons">
        {buttons}
      </div>
      <ul>{list}</ul>
    </div>
  );
}

import React, {useState} from 'react';
import './App.css';
import infos, {Ref} from "../infos";

type Elem = JSX.Element;

export default function App() {

  const g = (ref: Ref) => (<li><a href={ref.url}>{ref.name}</a></li>);
  const workLinks = infos.work.map(g);
  const adLinks = infos.ads.map(g);
  const musicLinks = infos.music.map(g);

  const [list, listSetter] = useState(adLinks);
  const buttons = [[workLinks, "Work"], [adLinks, "Recommendations"], [musicLinks, "Music"]]
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

import React, { useState } from 'react';
import { LexAnalyzer } from '../../store/LexAnalyzer';

const MainApp = () => {
  const [analyzer] = useState(() => new LexAnalyzer());

  //@ts-ignore
  const onFileLoad = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    if (file.name.split('.').pop() == 'txt') {
      // setButDisable(false);
      reader.readAsText(file, 'utf-8');
      reader.onload = () => {
        console.log(reader.result?.toString());
        analyzer.setSource(reader.result!.toString());
      };
    } else {
      // notificationNotJson();
      // setButDisable(true);
    }
  };

  return (
    <>
      <div>
        <input type={'file'} onInput={onFileLoad} placeholder={'input file'} />
      </div>
    </>
  );
};

export default MainApp;

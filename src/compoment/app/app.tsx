import React from 'react';

const MainApp = () => {
    const MainStore = () => {
        
    }

    const onFileLoad = (e) => {      
      const file = e.target.files[0];
      const reader = new FileReader();
      if (file.name.split('.').pop() == 'txt') {
        // setButDisable(false);
        reader.readAsText(file, 'utf-8');
        reader.onload = () => {
          jsonStore.tokens.tokens = JSON.parse(reader.result!.toString());
        };
      } else {
        notificationNotJson();
        setButDisable(true);
      }
  };

  return (
    <>
      <div>
        <input type={'file'} onLoad={onFileLoad} placeholder={'input file'} />
      </div>
    </>
  );
};

export default MainApp;

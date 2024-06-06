'use client';
import LixiButton from '@/src/components/Button/LixiButton';
import { CheckCircleOutline } from '@mui/icons-material';
import { Alert } from '@mui/material';
// import { useBackButton, useHapticFeedback, useMainButton, usePopup } from '@tma.js/sdk-react';
import stylex from '@stylexjs/stylex';
import { useEffect, useMemo, useState } from 'react';
import BackupSeed, { BackupWordModel } from './backup-seed';

const backupStyle = stylex.create({
  container: {
    padding: '1rem'
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    textAlign: 'center'
  },
  img: {
    alignSelf: 'center',
    filter: 'drop-shadow(2px 4px 6px black)'
  },
  headerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline'
  },
  headerTitle: {
    marginTop: '1rem'
  },
  headerSubtitle: {
    fontSize: '12px',
    color: '#d5d5d5'
  },
  contentContainer: {
    padding: '1rem 0'
  },
  contentItemContainer: {
    marginBottom: '1rem'
  },
  contentItemTitle: {
    padding: 0,
    paddingBottom: '1rem',
    fontSize: '14px',
    color: '#edeff099'
  },
  wordContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    columnGap: '1rem',
    rowGap: '1rem'
  },
  word: {
    padding: '0.5rem',
    background: '#2c2c2c',
    borderRadius: '8px'
  },
  wordNumber: {
    color: 'gray',
    fontSize: '12px'
  },
  wordLetter: {
    fontSize: '14px',
    color: '#fff'
  }
});

const wordGuessStyle = stylex.create({
  container: {
    padding: '1rem',
    background: '#2c2c2c',
    fontSize: '14px'
  },
  content: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem'
  },
  randomWord: {
    padding: '0.5rem 1rem',
    border: '1px solid gray',
    background: '#161b22',
    borderRadius: '8px',
    fontSize: '14px'
  }
});

export default function Backup() {
  const [mnemonicWordsConverted, setMnemonicWordsConverted] = useState<Array<BackupWordModel>>([
    {
      word: 'firm',
      isCorrect: true,
      isBlur: true
    },
    {
      word: 'panther',
      isCorrect: true,
      isBlur: true
    },
    {
      word: 'globe',
      isCorrect: true,
      isBlur: true
    },
    {
      word: 'worry',
      isCorrect: true,
      isBlur: true
    },
    {
      word: 'affair',
      isCorrect: true,
      isBlur: true
    },
    {
      word: 'solve',
      isCorrect: true,
      isBlur: true
    },
    {
      word: 'monitor',
      isCorrect: true,
      isBlur: true
    },
    {
      word: 'reason',
      isCorrect: true,
      isBlur: true
    },
    {
      word: 'carpet',
      isCorrect: true,
      isBlur: true
    },
    {
      word: 'yellow',
      isCorrect: true,
      isBlur: true
    },
    {
      word: 'return',
      isCorrect: true,
      isBlur: true
    },
    {
      word: 'labor',
      isCorrect: true,
      isBlur: true
    }
  ]);
  const [isPlayGame, setIsPlayGame] = useState<boolean>(false);
  const [countWord, setCountWord] = useState(0);
  const [libWord, setLibWord] = useState<string[]>([]);
  const [randomListFinal, setRandomListFinal] = useState<string[]>([]);
  // const mainButton = useMainButton();
  // const backButton = useBackButton();
  // const popUp = usePopup();
  // const haptic = useHapticFeedback();

  // useEffect(() => {
  //   mainButton.enable().show();
  //   backButton.show();
  //   mainButton.setText('Continue');
  // }, []);

  // useEffect(() => {
  //   mainButton.on('click', onMainButtonClick);
  //   backButton.on('click', onBackButtonClick);
  // }, [mainButton, backButton]);

  const onMainButtonClick = () => {
    setIsPlayGame(!isPlayGame);
  };

  const onBackButtonClick = () => {
    // backButton.hide();
    // mainButton.hide();
    // mainButton.off('click', onMainButtonClick);
    // backButton.off('click', onBackButtonClick);
    // navigate({ to: '/setting' });
  };

  const finalStep = () => {
    // haptic.notificationOccurred('warning');
    // popUp
    //   .open({
    //     title: 'Perfect!',
    //     message:
    //       'In order to protect your funds from being accessible to hackers and thieves, store this recovery phrase in a safe and secure place.',
    //     buttons: [{ id: 'send-ok', type: 'ok' }]
    //   })
    //   .then((rs) => {
    //     console.log(rs);
    //     navigate({ to: '/wallet' });
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });
  };

  const memoizedLibWord = useMemo(() => {
    return libWord;
  }, [libWord]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    createRandom();
  }, [memoizedLibWord]);

  const fetchData = () => {
    fetch('/backup-word.txt')
      .then((response) => response.text())
      .then((data) => {
        const result = data.split(/\r\n|\n/);
        setLibWord(result);
      });
  };

  const createRandom = (tempCount?: number) => {
    const randomList = [mnemonicWordsConverted[tempCount || countWord].word];
    for (let i = 0; i < 2; i++) {
      let isDone = true;
      while (isDone) {
        const randomNumber = Math.floor(Math.random() * libWord.length);
        const wordRandom = libWord[randomNumber];
        if (wordRandom !== mnemonicWordsConverted[tempCount || countWord].word) {
          randomList.push(wordRandom);
          isDone = false;
        }
      }
    }
    shuffleArray(randomList);
    setRandomListFinal([...randomList]);
  };

  const shuffleArray = (array: string[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  const checkWord = async (word: string) => {
    if (word === mnemonicWordsConverted[countWord].word) {
      mnemonicWordsConverted[countWord].isCorrect = true;
      mnemonicWordsConverted[countWord].isBlur = false;
      setMnemonicWordsConverted((prev) => {
        const updatedArray = [...prev];
        updatedArray[countWord] = {
          ...updatedArray[countWord],
          isCorrect: true
        };

        return updatedArray;
      });
      setCountWord(countWord + 1);
      const tempCount = countWord + 1;
      if (tempCount === 12) {
        finalStep();
      } else {
        createRandom(tempCount);
      }
    } else {
      setMnemonicWordsConverted((prev) => {
        const updatedArray = [...prev];
        updatedArray[countWord] = {
          ...updatedArray[countWord],
          isCorrect: false
        };

        return updatedArray;
      });
    }
  };

  return (
    <div {...stylex.props(backupStyle.container)}>
      <div {...stylex.props(backupStyle.info)}>
        <picture>
          <img width={96} height={96} src="/setting.svg" alt="" {...stylex.props(backupStyle.img)} />
        </picture>
        <div {...stylex.props(backupStyle.headerContainer)}>
          <h2 {...stylex.props(backupStyle.headerTitle)}>
            {!isPlayGame ? 'Your recovery phrase' : 'Verify your phrase'}
          </h2>
        </div>
      </div>
      <div {...stylex.props(backupStyle.contentContainer)}>
        <div {...stylex.props(backupStyle.contentItemContainer)}>
          <p {...stylex.props(backupStyle.contentItemTitle)}>
            {!isPlayGame
              ? `Your recovery key is composed of 12 randomly selected words. Please
            carefully write down each word in the order it appears.`
              : `Let check your wrote down the phrase correctly. Please select each word in the numbered order.`}
          </p>
          {!isPlayGame ? (
            <Alert icon={<CheckCircleOutline className="ico-alert" fontSize="inherit" />} severity="warning">
              Never share your recovery phrase with anyone, store it securely !
            </Alert>
          ) : (
            <div {...stylex.props(wordGuessStyle.container)}>
              <div>{'Word #' + (countWord + 1 > 12 ? 12 : countWord + 1)}</div>
              <div {...stylex.props(wordGuessStyle.content)}>
                {randomListFinal &&
                  randomListFinal.map((word, index) => {
                    return (
                      <div key={index} {...stylex.props(wordGuessStyle.randomWord)} onClick={() => checkWord(word)}>
                        {word}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        <BackupSeed mnemonicWords={mnemonicWordsConverted} isPlayGame={isPlayGame} />
      </div>
      <LixiButton variant="linear">Continue</LixiButton>
    </div>
  );
}

import './App.css';
import { generateAccount, useSliceDispatch as useLixiSliceDispatch } from '@bcpros/redux-store';

const App = () => {

  const dispatch = useLixiSliceDispatch();

  return (
    <>
      <div>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => dispatch(generateAccount({ coin: 'XPI' }))}>Generate new account</button>
      </div>
    </>
  );
};

export default App;

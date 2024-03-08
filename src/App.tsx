import React, { FC, useEffect, useState } from 'react';

import styles from './App.module.scss';

const BASE_URL = process.env.REACT_APP_BASE_URL;

interface Param {
  id: number;
  name: string;
  type: 'string';
}

interface ParamValue {
  paramId: number;
  value: string;
}

interface Model {
  paramValues: ParamValue[];
}

interface ModelEditorProps {
  params: Param[];
  model: Model;
}

interface ParamEditorProps {
  param: Param;
  paramValue?: ParamValue;
  onParamChange: (paramId: number, value: string) => void;
  onBlur?: () => void;
  error?: string;
}

const ParamEditor: FC<ParamEditorProps> = ({
  param,
  paramValue,
  onParamChange,
  onBlur,
  error,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;

    onParamChange(param.id, newValue);
  };

  return (
    <>
      <label htmlFor={`${param.id}`}>{param.name}</label>
      {paramValue && (
        <div className={styles.inputWrap}>
          <input
            type='text'
            value={paramValue.value}
            onChange={handleChange}
            onBlur={onBlur}
          />
          {error && <span className={styles.error}>{error}</span>}
        </div>
      )}
    </>
  );
};

const StringParamEditor: FC<ParamEditorProps> = ({
  param,
  paramValue,
  onParamChange,
}) => {
  const [error, setError] = useState('');

  const validateInput = () => {
    if (!paramValue?.value) {
      setError('Поле обязательно для заполнения');
    } else if (/\d/.test(paramValue.value)) {
      setError('Ожидается строковое значение');
    } else {
      setError('');
    }
  };

  return (
    <ParamEditor
      param={param}
      paramValue={paramValue}
      onParamChange={onParamChange}
      onBlur={validateInput}
      error={error}
    />
  );
};

const ModelEditor: FC = () => {
  const [data, setData] = useState<ModelEditorProps | null>(null);

  useEffect(() => {
    const getModel = () => {
      console.log(data?.model.paramValues);
    };

    getModel();
  }, [data?.model.paramValues]);

  const fetchData = async () => {
    try {
      const response = await fetch(`${BASE_URL}/data.json`);
      const data = await response.json();

      setData(data);
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleParamChange = (paramId: number, value: string) => {
    setData((prevData) => {
      if (!prevData) return null;

      const updatedParamValues = prevData.model.paramValues.map((paramValue) =>
        paramValue.paramId === paramId ? { ...paramValue, value } : paramValue,
      );

      return { ...prevData, model: { paramValues: updatedParamValues } };
    });
  };

  const renderEditor = (param: Param) => {
    const paramValue = data?.model.paramValues.find(
      (value) => value.paramId === param.id,
    );

    switch (param.type) {
      case 'string':
        return (
          <StringParamEditor
            param={param}
            paramValue={paramValue}
            onParamChange={handleParamChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      {data?.params.map((param) => (
        <div key={param.id} className={styles.wrapper}>
          {renderEditor(param)}
        </div>
      ))}
    </div>
  );
};

const App: FC = () => {
  return (
    <>
      <ModelEditor />
    </>
  );
};

export default App;

import React, { FC, useCallback, useEffect, useState } from 'react';

import styles from './App.module.scss';

enum ParamType {
  String = 'string',
  Number = 'number',
  Array = 'array',
}

interface Param {
  id: number;
  name: string;
  type: ParamType;
}

interface ParamValue {
  paramId: number;
  value: string;
}

interface Model {
  paramValues: ParamValue[];
}

interface ParamEditorProps {
  params: Param[];
  model: Model;
  onModelChange: (model: Model) => void;
}

const getParamName = (name: string | Array<string>) =>
  Array.isArray(name) ? name.join(', ') : name;

const ParamEditor: FC<ParamEditorProps> = ({
  params,
  model,
  onModelChange,
}) => {
  const [editedModel, setEditedModel] = useState<Model>({
    paramValues: [...model.paramValues],
  });

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, paramId: number) => {
      if (!editedModel) return;

      const newValue = event.target.value;
      const updatedParamValues = editedModel.paramValues.map((paramValue) =>
        paramValue.paramId === paramId
          ? { ...paramValue, value: newValue }
          : paramValue,
      );

      setEditedModel((prevModel) => ({
        ...prevModel,
        paramValues: updatedParamValues,
      }));
    },
    [editedModel.paramValues],
  );

  const getModel = () => {
    console.log(editedModel);
  };

  useEffect(() => {
    onModelChange(editedModel);
    getModel();
  }, [editedModel]);

  return (
    <form className={styles.form}>
      {params.map((param) => (
        <div key={param.id} className={styles.wrapper}>
          <label htmlFor={`${param.id}`}>{getParamName(param.name)}</label>
          <input
            type='text'
            id={`${param.id}`}
            value={
              editedModel.paramValues.find(
                (value) => value.paramId === param.id,
              )?.value || ''
            }
            onChange={(e) => handleInputChange(e, param.id)}
          />
        </div>
      ))}
    </form>
  );
};

const typeCheckers: { [key: string]: (value: any) => boolean } = {
  number: (value: any) =>
    !Number.isNaN(parseFloat(value)) && Number.isFinite(value),
  array: (value: any) => Array.isArray(value),
};

const getParamType = async (data: ParamEditorProps) => {
  return data.params.map((param: Param) => {
    let paramType: ParamType = ParamType.String;

    Object.entries(typeCheckers).some(([type, check]) => {
      if (check(param.name)) {
        paramType = type as ParamType;

        return true;
      }

      return false;
    });

    return {
      ...param,
      type: paramType,
    };
  });
};

const App: FC = () => {
  const [data, setData] = useState<ParamEditorProps | null>(null);

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:3000/data.json');
      const data = await response.json();
      const paramsWithTypes = await getParamType(data);

      setData({ ...data, params: paramsWithTypes });
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleModelChange = (editedModel: Model) => {
    setData((prevData) =>
      prevData ? { ...prevData, model: editedModel } : null,
    );
  };

  return (
    <div>
      {data ? (
        <ParamEditor
          params={data.params}
          model={data.model}
          onModelChange={handleModelChange}
        />
      ) : (
        <span>Загрузка данных...</span>
      )}
    </div>
  );
};

export default App;

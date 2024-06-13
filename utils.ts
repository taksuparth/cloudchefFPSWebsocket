const getNetworkMessage = (receiverId: string, senderId: string, func: string, payload: any, taskId: string): string =>
  JSON.stringify({
    receiverId,
    senderId,
    function: func,
    payload,
    taskId,
  });

const getStartRecipe = (taskId: string) => {
  const recipeSteps = [
    {
      accessoryIds: ['9031105', '9031105', '9031106', 'accessoryId3'],
      media: {
        textInstruction: 'Tag all Containers',
      },
      stepIndex: 2,
      stepTime: 20,
      type: 'fetch_accessory',
    },
    {
      stepIndex: 4,
      type: 'start_time_correction',
    },
    {
      containerIds: ['barcode_1', 'barcode_2'],
      media: {
        textInstruction: 'Tag all Containers',
        videoURl: 'some url',
      },
      stepIndex: 5,
      stepTime: 20,
      type: 'add',
    },
    {
      stepIndex: 7,
      stepTime: 100,
      type: 'wait_time',
    },
    {
      containerIds: ['barcode_3', 'barcode_4'],
      media: {
        textInstruction: 'Tag all Containers',
        videoURl: 'some url 2',
      },
      stepIndex: 9,
      stepTime: 20,
      type: 'add',
    },
    {
      stepIndex: 10,
      stepTime: 200,
      type: 'wait_time',
    },
    {
      media: {
        images: ['image url1'],
        textInstruction: 'Some human action',
      },
      instruction: 'Some human action',
      stepIndex: 12,
      stepTime: 20,
      type: 'human_action',
    },
    {
      media: {
        textInstruction: 'Stir to mix',
        videoURL: 'some url',
      },
      instruction: 'Stir to mix',
      stepIndex: 13,
      stepTime: 50,
      type: 'stir',
    },
    {
      containerIds: ['barcode_5'],
      media: {
        textInstruction: 'Tag all Containers',
        videoURl: 'some url 3',
      },
      stepIndex: 14,
      stepTime: 20,
      type: 'add',
    },
    {
      media: {
        textInstruction: 'Stir to mix',
        videoURL: 'some url',
      },
      instruction: 'Stir to mix',
      stepIndex: 16,
      stepTime: 10,
      type: 'stir',
    },
    {
      stepIndex: 18,
      type: 'end_time_correction',
    },
    {
      stepIndex: 20,
      stepTime: 20,
      type: 'wait_time',
    },
    {
      containerIds: ['barcode_output'],
      media: {
        textInstruction: 'Create Containers',
        videoURl: 'some url 4',
      },
      stepIndex: 21,
      stepTime: 20,
      type: 'create_output',
    },
  ];
  const inputContainerData = {
    barcode_1: {
      containerId: 'barcode_1',
      displayCode: 'AA1',
      isCreated: true,
      leadTime: 10,
    },
    barcode_2: {
      containerId: 'barcode_2',
      displayCode: 'AA2',
      isCreated: true,
      leadTime: 20,
    },
    barcode_3: {
      containerId: 'barcode_3',
      displayCode: 'AA3',
      isCreated: true,
      leadTime: 30,
    },
    barcode_4: {
      containerId: 'barcode_4',
      displayCode: 'AA4',
      isCreated: false,
      leadTime: 40,
    },
    barcode_5: {
      containerId: 'barcode_5',
      displayCode: 'AA5',
      isCreated: true,
      leadTime: 50,
    },
  };
  const outputContainerData = {
    barcode_output: {
      containerId: 'barcode_output',
      displayCode: 'Output -32',
    },
  };
  const accessoriesData = {
    '9031105': {
      barcode: 'barcode1',
      displayName: 'Sauce Pan',
      image: 'url1',
    },
    '9031106': {
      barcode: 'barcode2',
      displayName: 'Fry Pan',
      image: 'url2',
    },
    accessoryId3: {
      displayName: 'Pressure Cooker',
      image: 'url3',
    },
  };

  const payload = {
    taskId: taskId,
    subrecipe_name: 'sub recipe 2',
    recipe_name: 'Recipe 1',
    quantity: '1232g',
    duration: 3550,
    recipeSteps: recipeSteps,
    inputContainerData: inputContainerData,
    outputContainerData: outputContainerData,
    accessoriesData: accessoriesData,
  };

  return getNetworkMessage('receiverId', 'senderId', 'startRecipe', payload, taskId);
};

const getRecipesList = () => {
  const payload = [
    {
      recipe_name: 'Recipe Name 1',
      subrecipe_name: 'sub recipe 1',
      quantity: '1212344g',
      taskId: 'taskId1',
    },
    {
      recipe_name: 'Recipe Name 2',
      subrecipe_name: 'sub recipe 2',
      quantity: '1241234g',
      taskId: 'taskId2',
    },
    {
      recipe_name: 'Recipe Name 3',
      subrecipe_name: 'sub recipe 3',
      quantity: '122314g',
      taskId: 'taskId3',
    },
    {
      recipe_name: 'Recipe Name 4',
      subrecipe_name: 'sub recipe 4',
      quantity: '1223g',
      taskId: 'taskId4',
    },
    {
      recipe_name: 'Recipe Name 4',
      subrecipe_name: 'sub recipe 5',
      quantity: '1223g',
      taskId: 'taskId5',
    },
  ];

  return getNetworkMessage('receiverId', 'senderId', 'setCompatibleRecipes', payload, 'taskId');
};

export const getResponseMessage = async (recievedMessage: string): Promise<string | undefined> => {
  const parsedRecievedMessage = JSON.parse(recievedMessage);

  let messageToSend;
  if (parsedRecievedMessage.function === 'getCompatibleRecipes') {
    messageToSend = getRecipesList();
  } else if (parsedRecievedMessage.function === 'canStartRecipe') {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulating a delay
    messageToSend = getStartRecipe(parsedRecievedMessage.taskId);
  }

  return messageToSend;
};

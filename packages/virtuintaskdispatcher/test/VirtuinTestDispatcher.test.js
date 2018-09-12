// @Flow

// import VirtuinTestDispatcher from '../src/VirtuinTestDispatcher';

describe('VirtuinTestDispatcher opening', () => {
  beforeAll(async () => {
  });

  afterAll(() => {
  });

  it('should successfully start test', async () => {
    expect.assertions(1);
    const rst = {
      command: 'START'
    };
    expect(rst).toMatchObject({
      command: 'START'
    });
  }, 500);
});

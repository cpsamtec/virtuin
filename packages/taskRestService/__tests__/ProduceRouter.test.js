import request from 'supertest-as-promised';
import Api from '../src/Api';

const app = new Api().express;

describe('Virtuin Rest API', () => {

  describe('PUT /api/v1/virtuin/:id - update progress', () => {
    it('shows a task updating its progress', () => {
      return request(app).put('/api/v1/virtuin/progress/12345/44')
      .send({})
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.message.startsWith('Success!')).toBe(true);
        expect(res.body.percent).toBe(44);
      });
    });
    it('reject an invalid progress (percent) range', () => {
      return request(app).put('/api/v1/virtuin/progress/12345/444')
      .send({})
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.message.startsWith('Invalid')).toBe(true);
        expect(res.body.received).toBe(444);
      });
    });
  });


});

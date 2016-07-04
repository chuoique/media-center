import test from 'ava';
import 'babel-core/register';
import sinon from 'sinon';

import createApp from '../fixtures/create-app';
import agent from '../fixtures/agent';

test.beforeEach(async t => {
  const stub = sinon.stub().returns(Promise.resolve());
  const playerServiceMock = {
    default: () => ({ play: stub })
  };

  t.context.stub = stub;
  t.context.app = await createApp({ playerServiceMock });
  t.context.request = agent(t.context.app.server);
});

test.afterEach(async t => {
  t.context.app.server.close();
});

import {
  youtubeRequestSchema,
  statusStringResponse
} from '../fixtures/api-schemas';

test('POST /api/v1/youtube', async t => {
  const query = 'https://www.youtube.com/watch?v=8Pb-MQCPQsc';

  const { body } = await t.context.request.post(
    '/api/v1/youtube',
    { query },
    youtubeRequestSchema,
    statusStringResponse
  );

  t.truthy(t.context.stub.calledOnce === true);
  t.truthy(t.context.stub.firstCall.args[0].uri === 'youtube-url');
  t.truthy(t.context.stub.firstCall.args[0].traktScrobble === false);
})
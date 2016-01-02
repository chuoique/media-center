import test from 'ava';
import 'babel-core/register';
import mock from 'mock-fs';
import findFiles from './../src/find-files';
import initDb from './../src/db';

const testDb = '/tmp/media-center-db-' + Math.random();
const testDir = '/home/pi/video';

const showFolder = 'Master of None S01 Season 1 Complete 1080p WEB-DL [rartv]';

const showTitle = 'Master Of None';
const showImdb = 'tt4635276';

const showFile1 = 'Master.of.None.S01E01.Plan.B.1080p.NF.WEBRip.DD5.1.x264-NTb.mkv';
const showFile2 = 'Master.of.None.S01E02.Parents.1080p.NF.WEBRip.DD5.1.x264-NTb.mkv';

const movieFolder = 'Minions 2015 1080p BluRay x264 AC3-JYK';
const movieFile = 'Minions 2015 1080p BluRay x264 AC3-JYK.mkv';

const movieTitle = 'Minions';

const nearestDate = new Date(2);
const pastDate = new Date(1);

let db;

test.before(async t => {
	db = initDb(testDb);

	await db.addFile([testDir, showFolder, showFile1].join('/'), {
		type: 'show',
		title: showTitle,
		s: 1,
		e: 1,
		imdb: showImdb
	});

	mock({
	  [testDir]: {
	    [showFolder]: mock.directory({
				birthtime: pastDate,
		    items: {
					[showFile1]: '',
					[showFile2]: ''
		    }
			}),
	    [movieFolder]: mock.directory({
				birthtime: nearestDate,
		    items: {
					[movieFile]: ''
		    }
			})
	  }
	});
});

test.after(() => {
	mock.restore();
});

test('file utils', async t => {
	const result = await findFiles(db, testDir);

	t.same(result[0].birthtime, nearestDate);
	t.same(result[0].dir, [testDir, movieFolder].join('/'));
	t.same(result[0].file, [testDir, movieFolder, movieFile].join('/'));
	t.same(result[0].db, undefined);
	t.same(result[0].recognition.type, 'movie');
	t.same(result[0].recognition.title, movieTitle);
	t.same(result[0].recognition.year, 2015);

	t.same(result[1].dir, [testDir, showFolder].join('/'));
	t.same(result[1].birthtime, pastDate);

	const items = result[1].contents;

	t.same(items[0].file, [testDir, showFolder, showFile1].join('/'));
	t.same(items[0].db.title, showTitle);
	t.same(items[0].db.imdb, showImdb);
	t.same(items[0].recognition.type, 'show');
	t.same(items[0].recognition.title, showTitle);
	t.same(items[0].recognition.s, 1);
	t.same(items[0].recognition.ep, 1);
	t.same(items[0].recognition.imdb, showImdb);

	t.same(items[1].file, [testDir, showFolder, showFile2].join('/'));
	t.same(items[1].db, undefined);
	t.same(items[1].recognition.type, 'show');
	t.same(items[1].recognition.title, showTitle);
	t.same(items[1].recognition.s, 1);
	t.same(items[1].recognition.ep, 2);
	t.same(items[1].recognition.imdb, showImdb);
});
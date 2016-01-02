import globby from 'globby';
import fs from 'fs';
import _ from 'lodash';
import Promise from 'bluebird';
import split from 'split-torrent-release';

const loadRecognition = (db, item) => {
	item.recognition = split(item.filename || item.dirname);

	if (!item.recognition) {
		return item;
	} else {
		return db
			.getPrefix(item.recognition.title)
			.then((res) => {
				res.s = item.recognition.s;
				res.ep = item.recognition.ep;

				item.db = res;
			}, (err) => {
				if (err.status !== 404) {
					throw err;
				}
			})
			.then(() => item);
	}
};

const loadFile = (db, item) => {
	return db
		.getFile(item.file).then((res) => res, (err) => {
			if (err.status !== 404) {
				throw err;
			}

			return undefined;
		}).then((res) => {
			item.db = res;
			return loadRecognition(db, item);
		});
};

export default (db, dir) => {
	return globby(['**/*.mkv'], { cwd: dir, realpath: true })
		.then(items => {
			const flatFiles = items.map(item => {
				const data = item.split('/');
				const dir = data.slice(0, data.length - 1).join('/');

				return {
					dir,
					file: item,
					filename: data[data.length - 1],
					dirname: data[data.length - 2]
				};
			});

			const grouped = _.groupBy(flatFiles, 'dir');
			const combined = _.map(grouped, (curr, dir) => ({ curr, dir }));

			const result = Promise.reduce(combined, (result, { curr, dir }) => {
				if (curr.length === 1) {
					const item = curr[0];
					item.birthtime = fs.statSync(item.dir).birthtime;

					return loadFile(db, item)
						.then((res) => {
							result.push(item);
							return result;
						});
				} else {
					return Promise
						.map(curr, (item) => loadFile(db, item))
						.then((res) => {
							const item = {
								dir,
								dirname: curr[0].dirname,
								contents: res,
								birthtime: fs.statSync(dir).birthtime
							};

							result.push(item);
							return loadRecognition(db, item);
						})
						.then(() => result);
				}

				return result;
			}, []);

			return result;
		})
		.then((result) => {
			result.sort((a, b) => b.birthtime - a.birthtime);
			return result;
		});
};
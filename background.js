/*

Copyright 2021 Adam Reichold

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.

*/

async function* walkList(page) {
    yield page.messages;

    while (page.id) {
        page = await browser.messages.continueList(page.id);

        yield page.messages;
    }
}

async function forEachSubFolder(folder, action) {
    await action(folder);

    for (const subFolder of folder.subFolders) {
        await forEachSubFolder(subFolder, action);
    }
}

async function archiveOlderThan(folder, toDate) {
    const page = await browser.messages.query({
        folder: folder,
        toDate: toDate,
    });

    for await (const messages of walkList(page)) {
        await browser.messages.archive(messages);
    }
}

browser.menus.create({
    id: "archiveOlderThanOneYear",
    title: "Archive older than one year",
    contexts: ["folder_pane"],
    async onclick(info) {
        let toDate = Date.now();
        toDate.setFullYear(toDate.getFullYear() - 1);

        await forEachSubFolder(info.selectedFolder, folder => archiveOlderThan(folder, toDate));
    },
});

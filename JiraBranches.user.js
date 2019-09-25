// ==UserScript==
// @name         JiraBranches
// @namespace    com.cgd
// @version      0.3
// @description  Displays additional info on Jira issue viewer regarding BitBucket branches and pull-requests
// @author       CGD
// @match        https://*.atlassian.net/browse/*
// @connect      atlassian.net
// @require      https://raw.githubusercontent.com/charlesgael/userscripts/master/util/functions/dom/waitElement.js
// @require      https://raw.githubusercontent.com/charlesgael/userscripts/master/util/functions/dom/createElement.js
// @require      https://raw.githubusercontent.com/charlesgael/userscripts/master/util/functions/helpers/isNotNull.js
// @require      https://raw.githubusercontent.com/charlesgael/userscripts/master/util/functions/helpers/optionalAccess.js
// @require      https://raw.githubusercontent.com/charlesgael/userscripts/master/util/functions/helpers/ajax.js
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

const dom = createElement;

const images = {
    MERGED: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAKfSURBVDjLpZPrS1NhHMf9O3bOdmwDCWREIYKEUHsVJBI7mg3FvCxL09290jZj2EyLMnJexkgpLbPUanNOberU5taUMnHZUULMvelCtWF0sW/n7MVMEiN64AsPD8/n83uucQDi/id/DBT4Dolypw/qsz0pTMbj/WHpiDgsdSUyUmeiPt2+V7SrIM+bSss8ySGdR4abQQv6lrui6VxsRonrGCS9VEjSQ9E7CtiqdOZ4UuTqnBHO1X7YXl6Daa4yGq7vWO1D40wVDtj4kWQbn94myPGkCDPdSesczE2sCZShwl8CzcwZ6NiUs6n2nYX99T1cnKqA2EKui6+TwphA5k4yqMayopU5mANV3lNQTBdCMVUA9VQh3GuDMHiVcLCS3J4jSLhCGmKCjBEx0xlshjXYhApfMZRP5CyYD+UkG08+xt+4wLVQZA1tzxthm2tEfD3JxARH7QkbD1ZuozaggdZbxK5kAIsf5qGaKMTY2lAU/rH5HW3PLsEwUYy+YCcERmIjJpDcpzb6l7th9KtQ69fi09ePUej9l7cx2DJbD7UrG3r3afQHOyCo+V3QQzE35pvQvnAZukk5zL5qRL59jsKbPzdheXoBZc4saFhBS6AO7V4zqCpiawuptwQG+UAa7Ct3UT0hh9p9EnXT5Vh6t4C22QaUDh6HwnECOmcO7K+6kW49DKqS2DrEZCtfuI+9GrNHg4fMHVSO5kE7nAPVkAxKBxcOzsajpS4Yh4ohUPPWKTUh3PaQEptIOr6BiJjcZXCwktaAGfrRIpwblqOV3YKdhfXOIvBLeREWpnd8ynsaSJoyESFphwTtfjN6X1jRO2+FxWtCWksqBApeiFIR9K6fiTpPiigDoadqCEag5YUFKl6Yrciw0VOlhOivv/Ff8wtn0KzlebrUYwAAAABJRU5ErkJggg==',
    DECLINED: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAHdSURBVDjLpZNraxpBFIb3a0ggISmmNISWXmOboKihxpgUNGWNSpvaS6RpKL3Ry//Mh1wgf6PElaCyzq67O09nVjdVlJbSDy8Lw77PmfecMwZg/I/GDw3DCo8HCkZl/RlgGA0e3Yfv7+DbAfLrW+SXOvLTG+SHV/gPbuMZRnsyIDL/OASziMxkkKkUQTJJsLaGn8/iHz6nd+8mQv87Ahg2H9Th/BxZqxEkEgSrq/iVCvLsDK9awtvfxb2zjD2ARID+lVVlbabTgWYTv1rFL5fBUtHbbeTJCb3EQ3ovCnRC6xAgzJtOE+ztheYIEkqbFaS3vY2zuIj77AmtYYDusPy8/zuvunJkDKXM7tYWTiyGWFjAqeQnAD6+7ueNx/FLpRGAru7mcoj5ebqzszil7DggeF/DX1nBN82rzPqrzbRayIsLhJqMPT2N83Sdy2GApwFqRN7jFPL0tF+10cDd3MTZ2AjNUkGCoyO6y9cRxfQowFUbpufr1ct4ZoHg+Dg067zduTmEbq4yi/UkYidDe+kaTcP4ObJIajksPd/eyx3c+N2rvPbMDPbUFPZSLKzcGjKPrbJaDsu+dQO3msfZzeGY2TCvKGYQhdSYeeJjUt21dIcjXQ7U7Kv599f4j/oF55W4g/2e3b8AAAAASUVORK5CYII=',
    OPEN: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAKASURBVDjLxVNLTxNRFP7udDp9TCEtFSzloUBwY4FUF0ZjVDYsTDSw0/gjXBii/gk2GjZudO1G4wONK40CGkQSRKTybqGAfVHa6dy5M/d6WwMhccnCk3yLk3u+L9+55xwihMBRQsERQz2crK+vX3Txyn1SyfXDMnyE24AjwR0Q4qLQw1M82H4vGo1+3OeQ/RZSqdQTV2XnhkKzmqaoYJaJQj4P27LgcQGNdTocRmFzyWiJv2zqil0/EJDkt67C0oAGhtTmJpLpHEwSAPNEwBwCy+bQ7W1EsYlYWxiKdMSjvbPhniu96tra2ohmbAxovILZxCq0E5dh6M1g0jllAqYEZRw7lhRp1ZDdewW9tILAykRPingfk9Ti7BbJJ47viiC645cwNm2gYPAaefhWH4TgGB79JoU4vG6Cu0MNyMx/Bv8+hkzJtlWWW27yRfrQ0dhS+4sq0aAOqHQgOK8JGJbMKZf9/h1asPssyv56sBejqupuinEtEHI5jgNFURCuA5JZB6a0fPvBF1BLClbsmoPT7X5wKVqrbWhFqDMmFFHcKLLiNmzbBmMM7WEFAY2jbDCUJbFsMpQkjgUI4ifVWk21lqaXoBQ2mMJ94adi6wes5AxoMYOw7uBcl4JTEQFVULhhId5GcO2MJtuUEykXQRc+gb1/hLTl/VobY2JmctyfnTvvUwlEqCMPvdGEHrKgevj+wlTrxO8VL1+ebLaSc1gwA2kj9bPlYJGmPrx7bm0lrkbIrhrwewFPPbjbj+pzdSPtUh7YXsRqpiT2gp1T9NfEhcGR1zY5fEzjo3c8ud3SIKV0SJrp1wgCLjiS7/CKaU5LPCOcj918+Gb+n1X+b9f4B22tbKhgZZpBAAAAAElFTkSuQmCC',
    branch: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAIESURBVDjLpVLPS9NxGH7mjw3cZmvGclsFxcwQpFsQCRLBvIZJEC7LkyVdO5gnDx0i2qk/IAipyA5GBYoQkX0rWIaxTYvad9E85IbVcd/P834+HcZWKZtRz/V9n4f3eZ7XZYzB/6Cp0XB8/tzrsSeJxX8SuDg3stzZFj7S6Y0cO//g9Nt6e67NFi4tjLpFJBNuC8e6OrqhjUZ6LQ173f5AJb0zo4+chheQ8phK9pACGoKa8Lq9oMN9dPhw2wuqGLk/ZI53n4A2GtaKhdKP0tHZsblXm/da6nmjkrIjyqONoPS9VJ69sJVcN8Qz0yf7fG6fRxsN0QKfx++JJ/v7tg0xce9UTJRMkjx7KNrTHNoZgmii8HUNS5kloZLbJK9aU6mPWwQSdweHSJnev+uAO9IRgYZB8VsRIkRgRxDUCp/yOaQzGUcow2+uv5upCQzfGWwmud6793Cw3dcOUiFrryBfyM+LEkR2R+NdsRgMXCgW1/Fi0doQSih98700VQJjtAWtQb/XDwqxaq8i/yWfXLj8fODpFWsgZ+eSmWwWoolAMIBWtztISrQWolIEFaGk0rtdyEMpTlR9KsWJXM6GGAG1QJRAKL9aoEMop0KmEE7ZwbPJl7WPS11bdpyyArVA6wpZRP8ZYvxGv6EiqAQkYU2lXL/X1TN+0FSJWjRytz67Gn7i3+In2xhLsvVnPqcAAAAASUVORK5CYII=',
};

GM_addStyle(`

.jira-branches {
    margin-top: 10px;
    padding: 4px 8px;
    background: linear-gradient(#e5e5e5, #cFcFcF);
    box-shadow: 1px 2px 20px rgba(255,255,255,.6) inset, 1px 2px 5px 1px rgba(0,0,0,0.5);
}

.jira-branches .float.left {
    float: left;
}

.jira-branches .float.right {
    float: right;
}

.jira-branches .branch-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-left: 30px;
    margin-right: 20px;
}

.jira-branches h1 {
    font-size: 1.2em;
}

`);

const branch_re = /bitbucket.org\/[^\/]+\/\{([^\/]+)\}\/branch\/([^\/]+)/;

function type(repo) {
    const repoNames = JSON.parse(GM_getValue('repoNames', '{}'));
    console.log('REPO NAMES', repoNames);
    const setRepoName = function() {
        const val = prompt(`New name for repository '${repo}' (max 10 characters)`,
            optionalAccess(repoNames, `[${repo}]`, `${repo}`)
                .substring(0, 10));
        if (val) {
            repoNames[repo] = val;
            GM_setValue('repoNames', JSON.stringify(repoNames));
            reload();
        }
    };

    const el = dom.span(null,
        '[',
        optionalAccess(repoNames, `[${repo}]`, `?${repo}`)
            .substring(0, 10)
            .padEnd(10, ' ')
            .toUpperCase()
            .replace(/ /g, '&nbsp;'),
        ']');
    el.addEventListener('dblclick', setRepoName);
    return el;
}

function status(st) {
    if (images[st]) {
        const img = dom.img(null, images[st]);
        img.width=12;
        img.height=12;
        return img;
    }
    return `[${st.toUpperCase().substr(0, 2)}]`;
}

function repositories(branches) {
    return branches
        .reduce((acc, val) => {
            const [, repoId] = /bitbucket.org\/\{\}\/\{([^}]*)\}/.exec(val.url);
            acc[repoId] = val.name;
            return acc;
        }, {});
}

function branchDisplay(branch) {
    const branchImg = dom.img(null, images.branch);
    branchImg.width = 12;
    branchImg.height = 12;
    const createPr = dom.a(null, `${branch.createPullRequestUrl}&dest=preprod`, branchImg);
    createPr.target = '_blank';
    const branchLink = dom.a(null, branch.url, branch.name);
    branchLink.target = '_blank';

    return dom.div(
        dom.div('float left',
            dom.code(null, type(branch.repository.name), '&nbsp;')),
        dom.div('float right',
            createPr),
        dom.div('branch-name',
            branchLink)
    );
}

function prDisplay(repositories) {
    return (pr) => {
        const [, repoId, branch] = branch_re.exec(pr.source.url);

        let prLink = dom.a(null, pr.url, `${branch} ↗ ${pr.destination.branch}`);
        prLink.target = '_blank';

        return dom.div(
            dom.div('float left',
                dom.code(null, type(repositories[repoId] || repoId), '&nbsp;')),
            dom.div('float right', status(pr.status)),
            dom.div('branch-name',
                prLink)
        );
    };
}

function show({branches, pullRequests}, inElement, issueId) {
    console.log('GOT INFO', {branches, pullRequests});
    ajax.post('https://izicap.atlassian.net/jsw/graphql', JSON.stringify({
        query: `{
                developmentInformation(issueId: ${issueId}){
                    details {
                        instanceTypes {
                            id
                            repository {
                                name
                                url
                                branches {
                                    name
                                    url
                                }
                            }
                        }
                    }
                }
            }`}), 'json',{
        headers: {
            'content-type': 'application/json'
        }})
        .catch(err=>console.log("Error in ajax request 'https://izicap.atlassian.net/jsw/graphql'", err))
        .then(function(res) {
            console.log('RAW', res);
            const {data: {developmentInformation: {details: {instanceTypes}}}} = res;
            console.log('INFO INSTANCES', instanceTypes);
            const [{repository: bitbucketInfo},] = instanceTypes.filter(it => it.id === 'bitbucket');
            console.log('Bitbucket INFO', bitbucketInfo);
            const reps = repositories(bitbucketInfo);
            console.log('REPOSITORIES', reps);
            const branchesInfo = branches
                .sort((a, b) => ('' + a.repository.name).localeCompare(b.repository.name))
                .map(branchDisplay)
                .filter(isNotNull);
            const prInfo = pullRequests
                .sort((a, b) => {
                    const [, repoA,] = branch_re.exec(a.source.url);
                    const [, repoB,] = branch_re.exec(b.source.url);
                    return ('' + (reps[repoA] || repoA)).localeCompare(reps[repoB] || repoB)
                })
                .map(prDisplay(reps))
                .filter(isNotNull);

            inElement.prepend(
                dom.div('jira-branches',
                    dom.h1(null, 'Branches'),
                    branchesInfo,
                    dom.h1(null, 'Pull-Requests'),
                    prInfo)
            );
        });
}

function displayBranchesAndPr(el) {
    console.log('_ old version detected');
    const id = el.value;
    console.log('_ id', id);
    ajax.get('https://izicap.atlassian.net/rest/dev-status/1.0/issue/detail',
        {
            applicationType: 'bitbucket',
            dataType: 'pullrequest',
            issueId: id
        }, 'json')
        .catch(err=>console.log("Error in ajax request 'https://izicap.atlassian.net/rest/dev-status/1.0/issue/detail'", err))
        .then((data) => show(data.detail[0], document.querySelector('#viewissuesidebar'), id));
}

function displayBranchesAndPr2(el) {
    console.log('_ new version detected', el);
    const {options: {productContext: {'issue.id': id}}} = JSON.parse(el.name);
    console.log('_ id', id);
    ajax.get('https://izicap.atlassian.net/rest/dev-status/1.0/issue/detail',
        {
            applicationType: 'bitbucket',
            dataType: 'pullrequest',
            issueId: id,
        }, 'json')
        .catch(err=>console.log("Error in ajax request 'https://izicap.atlassian.net/rest/dev-status/1.0/issue/detail'", err))
        .then((data) => show(data.detail[0], document.querySelector('.iGyYHq'), id));
}

function load() {
    waitElement('#issue-comment-add input[name=id]')
        .catch((err) => console.error("Error in selector '#issue-comment-add input[name=id]'", err))
        .then(displayBranchesAndPr);
    waitElement('iframe[id*="com.codebarrel"]')
        .catch((err) => console.error("Error in selector 'iframe[id*=\"com.codebarrel\"]'", err))
        .then(displayBranchesAndPr2);
}

function reload() {
    document.querySelectorAll('.jira-branches')
        .forEach(el=>el.parentNode.removeChild(el));

    load();
}

function removeStoredRepositories() {
    if (confirm('Are you sure you want to delete all stored repository names?')) {
        GM_deleteValue('repoNames');

        reload();
    }
}

load();

GM_registerMenuCommand('Reload', reload);
GM_registerMenuCommand('Remove stored repositories', removeStoredRepositories);
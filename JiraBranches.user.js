// ==UserScript==
// @name         JiraBranches
// @namespace    com.cgd
// @version      0.1
// @description  Switches from localhost to IP
// @author       CGD
// @match        https://*.atlassian.net/browse/*
// @require      https://raw.githubusercontent.com/charlesgael/userscripts/master/util/functions/dom/waitElement.js
// @require      https://raw.githubusercontent.com/charlesgael/userscripts/master/util/functions/helpers/isNotNull.js
// @require      https://raw.githubusercontent.com/charlesgael/userscripts/master/util/functions/helpers/optionalAccess.js
// @grant        none
// ==/UserScript==

const conf = {
    // Used to transform repo name in a readable 10 characters name (more is truncated)
    repoNames: {
        'com.izicap.clo': 'back',
        'web': 'front',
        'spark': 'spark',
        'kpis': 'kpis',
        'db-business': 'db-biz',
        'transactions-file': 'tr-file',
        'transaction-cash': 'tr-cash'
    }
};

const images = {
    MERGED: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAKfSURBVDjLpZPrS1NhHMf9O3bOdmwDCWREIYKEUHsVJBI7mg3FvCxL09290jZj2EyLMnJexkgpLbPUanNOberU5taUMnHZUULMvelCtWF0sW/n7MVMEiN64AsPD8/n83uucQDi/id/DBT4Dolypw/qsz0pTMbj/WHpiDgsdSUyUmeiPt2+V7SrIM+bSss8ySGdR4abQQv6lrui6VxsRonrGCS9VEjSQ9E7CtiqdOZ4UuTqnBHO1X7YXl6Daa4yGq7vWO1D40wVDtj4kWQbn94myPGkCDPdSesczE2sCZShwl8CzcwZ6NiUs6n2nYX99T1cnKqA2EKui6+TwphA5k4yqMayopU5mANV3lNQTBdCMVUA9VQh3GuDMHiVcLCS3J4jSLhCGmKCjBEx0xlshjXYhApfMZRP5CyYD+UkG08+xt+4wLVQZA1tzxthm2tEfD3JxARH7QkbD1ZuozaggdZbxK5kAIsf5qGaKMTY2lAU/rH5HW3PLsEwUYy+YCcERmIjJpDcpzb6l7th9KtQ69fi09ePUej9l7cx2DJbD7UrG3r3afQHOyCo+V3QQzE35pvQvnAZukk5zL5qRL59jsKbPzdheXoBZc4saFhBS6AO7V4zqCpiawuptwQG+UAa7Ct3UT0hh9p9EnXT5Vh6t4C22QaUDh6HwnECOmcO7K+6kW49DKqS2DrEZCtfuI+9GrNHg4fMHVSO5kE7nAPVkAxKBxcOzsajpS4Yh4ohUPPWKTUh3PaQEptIOr6BiJjcZXCwktaAGfrRIpwblqOV3YKdhfXOIvBLeREWpnd8ynsaSJoyESFphwTtfjN6X1jRO2+FxWtCWksqBApeiFIR9K6fiTpPiigDoadqCEag5YUFKl6Yrciw0VOlhOivv/Ff8wtn0KzlebrUYwAAAABJRU5ErkJggg==',
    DECLINED: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAHdSURBVDjLpZNraxpBFIb3a0ggISmmNISWXmOboKihxpgUNGWNSpvaS6RpKL3Ry//Mh1wgf6PElaCyzq67O09nVjdVlJbSDy8Lw77PmfecMwZg/I/GDw3DCo8HCkZl/RlgGA0e3Yfv7+DbAfLrW+SXOvLTG+SHV/gPbuMZRnsyIDL/OASziMxkkKkUQTJJsLaGn8/iHz6nd+8mQv87Ahg2H9Th/BxZqxEkEgSrq/iVCvLsDK9awtvfxb2zjD2ARID+lVVlbabTgWYTv1rFL5fBUtHbbeTJCb3EQ3ovCnRC6xAgzJtOE+ztheYIEkqbFaS3vY2zuIj77AmtYYDusPy8/zuvunJkDKXM7tYWTiyGWFjAqeQnAD6+7ueNx/FLpRGAru7mcoj5ebqzszil7DggeF/DX1nBN82rzPqrzbRayIsLhJqMPT2N83Sdy2GApwFqRN7jFPL0tF+10cDd3MTZ2AjNUkGCoyO6y9cRxfQowFUbpufr1ct4ZoHg+Dg067zduTmEbq4yi/UkYidDe+kaTcP4ObJIajksPd/eyx3c+N2rvPbMDPbUFPZSLKzcGjKPrbJaDsu+dQO3msfZzeGY2TCvKGYQhdSYeeJjUt21dIcjXQ7U7Kv599f4j/oF55W4g/2e3b8AAAAASUVORK5CYII=',
    OPEN: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAKASURBVDjLxVNLTxNRFP7udDp9TCEtFSzloUBwY4FUF0ZjVDYsTDSw0/gjXBii/gk2GjZudO1G4wONK40CGkQSRKTybqGAfVHa6dy5M/d6WwMhccnCk3yLk3u+L9+55xwihMBRQsERQz2crK+vX3Txyn1SyfXDMnyE24AjwR0Q4qLQw1M82H4vGo1+3OeQ/RZSqdQTV2XnhkKzmqaoYJaJQj4P27LgcQGNdTocRmFzyWiJv2zqil0/EJDkt67C0oAGhtTmJpLpHEwSAPNEwBwCy+bQ7W1EsYlYWxiKdMSjvbPhniu96tra2ohmbAxovILZxCq0E5dh6M1g0jllAqYEZRw7lhRp1ZDdewW9tILAykRPingfk9Ti7BbJJ47viiC645cwNm2gYPAaefhWH4TgGB79JoU4vG6Cu0MNyMx/Bv8+hkzJtlWWW27yRfrQ0dhS+4sq0aAOqHQgOK8JGJbMKZf9/h1asPssyv56sBejqupuinEtEHI5jgNFURCuA5JZB6a0fPvBF1BLClbsmoPT7X5wKVqrbWhFqDMmFFHcKLLiNmzbBmMM7WEFAY2jbDCUJbFsMpQkjgUI4ifVWk21lqaXoBQ2mMJ94adi6wes5AxoMYOw7uBcl4JTEQFVULhhId5GcO2MJtuUEykXQRc+gb1/hLTl/VobY2JmctyfnTvvUwlEqCMPvdGEHrKgevj+wlTrxO8VL1+ebLaSc1gwA2kj9bPlYJGmPrx7bm0lrkbIrhrwewFPPbjbj+pzdSPtUh7YXsRqpiT2gp1T9NfEhcGR1zY5fEzjo3c8ud3SIKV0SJrp1wgCLjiS7/CKaU5LPCOcj918+Gb+n1X+b9f4B22tbKhgZZpBAAAAAElFTkSuQmCC',
    branch: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAIESURBVDjLpVLPS9NxGH7mjw3cZmvGclsFxcwQpFsQCRLBvIZJEC7LkyVdO5gnDx0i2qk/IAipyA5GBYoQkX0rWIaxTYvad9E85IbVcd/P834+HcZWKZtRz/V9n4f3eZ7XZYzB/6Cp0XB8/tzrsSeJxX8SuDg3stzZFj7S6Y0cO//g9Nt6e67NFi4tjLpFJBNuC8e6OrqhjUZ6LQ173f5AJb0zo4+chheQ8phK9pACGoKa8Lq9oMN9dPhw2wuqGLk/ZI53n4A2GtaKhdKP0tHZsblXm/da6nmjkrIjyqONoPS9VJ69sJVcN8Qz0yf7fG6fRxsN0QKfx++JJ/v7tg0xce9UTJRMkjx7KNrTHNoZgmii8HUNS5kloZLbJK9aU6mPWwQSdweHSJnev+uAO9IRgYZB8VsRIkRgRxDUCp/yOaQzGUcow2+uv5upCQzfGWwmud6793Cw3dcOUiFrryBfyM+LEkR2R+NdsRgMXCgW1/Fi0doQSih98700VQJjtAWtQb/XDwqxaq8i/yWfXLj8fODpFWsgZ+eSmWwWoolAMIBWtztISrQWolIEFaGk0rtdyEMpTlR9KsWJXM6GGAG1QJRAKL9aoEMop0KmEE7ZwbPJl7WPS11bdpyyArVA6wpZRP8ZYvxGv6EiqAQkYU2lXL/X1TN+0FSJWjRytz67Gn7i3+In2xhLsvVnPqcAAAAASUVORK5CYII=',
};

const styles = {
    mainDiv:
        'margin-top: 10px;' +
        'padding: 4px 8px;' +
        'background: linear-gradient(#e5e5e5, #cFcFcF);' +
        'box-shadow: 1px 2px 20px rgba(255,255,255,.6) inset, 1px 2px 5px 1px rgba(0,0,0,0.5);',
    floatLeft: 'float: left;',
    floatRight: 'float: right;',
    branchName:
        'white-space: nowrap;' +
        'overflow: hidden;' +
        'text-overflow: ellipsis;' +
        'margin-left: 30px;' +
        'margin-right: 20px;',
    h1: 'font-size: 1.2em;',
};

const branch_re = /bitbucket.org\/[^\/]+\/\{([^\/]+)\}\/branch\/([^\/]+)/;

const $ = window.jQuery;

function type(repo) {
    return '[' +
        optionalAccess(conf, `repoNames[${repo}]`, `?${repo}`)
            .substring(0, 10)
            .padEnd(10, ' ')
            .toUpperCase()
            .replace(/ /g, '&nbsp;') +
        ']';
}

function status(st) {
    if (images[st]) {
        return '<img src="' + images[st] + '" width="12" height="12"/>';
    }
    return '[' + st.toUpperCase().substr(0, 2) + ']';
}

function repositories(branches) {
    return branches
        .reduce((acc, val) => {
            const [,repoId] = /bitbucket.org\/\{\}\/\{([^}]*)\}/.exec(val.url);
            acc[repoId] = val.name;
            return acc;
        }, {});
}

function branchDisplay(branch) {
    return '<div style="' + styles.floatLeft + '"><tt>' + type(branch.repository.name) + '&nbsp;</tt></div>' +
        '<div style="' + styles.floatRight + '"><a href="' + branch.createPullRequestUrl + '&dest=preprod" target="_blank" title="Create Pull-request">' +
        '<img src="' + images.branch + '" width="12" height="12"/></a></div>' +
        '<div style="' + styles.branchName + '">' +
        '<a href="' + branch.url + '" target="_blank">' + branch.name + '</a></div>';
}

function prDisplay(repositories) {
    return (pr) => {
        //if (pr.destination.branch !== 'preprod') return null;

        const [, repoId, branch] = branch_re.exec(pr.source.url);

        console.log(repositories);

        return '<div style="' + styles.floatLeft + '"><tt>' + type(repositories[repoId] || repoId) + '&nbsp;</tt></div>' +
            '<div style="' + styles.floatRight + '" title="' + pr.status + '">' + status(pr.status) + '</div>' +
            '<div style="' + styles.branchName + '">' +
            '<a href="' + pr.url + '" target="_blank">' + branch + ' ↗ ' + pr.destination.branch + '</a></div>';
    };
}

function show({branches, pullRequests}, inElement, issueId) {
    console.log('GOT INFO', {branches, pullRequests});
    $.ajax({
        url: 'https://izicap.atlassian.net/jsw/graphql',
        type: 'post',
        data: JSON.stringify({
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
                }`
        }),
        dataType: 'json',
        contentType: 'application/json',
        complete: function(raw) {
            console.log('RAW', raw);
            const {data: {developmentInformation: {details: {instanceTypes}}}} = JSON.parse(raw.responseText);
            console.log('INFO INSTANCES', instanceTypes);
            const [{repository: bitbucketInfo},] = instanceTypes.filter(it => it.id === 'bitbucket');
            console.log('Bitbucket INFO', bitbucketInfo);
            const reps = repositories(bitbucketInfo);
            console.log('REPOSITORIES', reps);
            const branchesInfo = branches
                .sort((a,b) => (''+a.repository.name).localeCompare(b.repository.name))
                .map(branchDisplay)
                .filter(isNotNull);
            const prInfo = pullRequests
                .sort((a,b) => {
                    const [, repoA,] = branch_re.exec(a.source.url);
                    const [, repoB,] = branch_re.exec(b.source.url);
                    return (''+(reps[repoA] || repoA)).localeCompare(reps[repoB] || repoB)
                })
                .map(prDisplay(reps))
                .filter(isNotNull);

            inElement.prepend('<div style="' + styles.mainDiv + '">' +
                '<h1 style="' + styles.h1 + '">Branches</h1>' + branchesInfo.join('') +
                '<h1 style="' + styles.h1 + '">Pull-Requests</h1>' + prInfo.join('') +
                '</div>');
        }
    });
}

function displayBranchesAndPr(el) {
    console.log('_ old version detected');
    const id = el.value;
    console.log('_ id', id);
    $.get('https://izicap.atlassian.net/rest/dev-status/1.0/issue/detail',
        {
            applicationType: 'bitbucket',
            dataType: 'pullrequest',
            issueId: id,
        },
        (data, status) => {
            if (status === 'success') {
                show(data.detail[0], $('#viewissuesidebar'), id);
            }
        },
    );
}

function displayBranchesAndPr2(el) {
    console.log('_ new version detected', el);
    const {options: {productContext: {'issue.id': id}}} = JSON.parse(el.name);
    console.log('_ id', id);
    $.get('https://izicap.atlassian.net/rest/dev-status/1.0/issue/detail',
        {
            applicationType: 'bitbucket',
            dataType: 'pullrequest',
            issueId: id,
        },
        (data, status) => {
            if (status === 'success') {
                show(data.detail[0], $('.iGyYHq').eq(0), id);
            }
        },
    );
}

waitElement('#issue-comment-add input[name=id]')
    .then(displayBranchesAndPr)
    .catch(()=>console.log("Error in selector '#issue-comment-add input[name=id]'", [...arguments]));
waitElement('iframe[id*="com.codebarrel"]')
    .then(displayBranchesAndPr2)
    .catch(()=>console.log("Error in selector 'iframe[id*=\"com.codebarrel\"]'", [...arguments]));
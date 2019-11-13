/* global define */
define(['underscore'], (_) => {
    'use strict';
    let browserUtils = {};

    const BROWSERS = [
        "chrome",
        "edge",
        "firefox",
        "safari",
    ];

    const UA = navigator.userAgent.toLowerCase();

    browserUtils.getBrowserName = () => {
        let names = BROWSERS.filter((name) => { return UA.includes(name) });

        if(names && names.length > 0) {
            if(names.length > 1) {
                if (names.includes("edge")) {
                    return "edge";
                }
                if (names.includes("chrome")) {
                    return "chrome";
                }
            }
            else {
                return names[0];
            }
        }
    };

    browserUtils.getBrowserVersion = () => {
        let name = browserUtils.getBrowserName();
        let versionMatch;
        let version = {
            major: 0,
            minor: 0,
        };

        if (name === "safari") {
            versionMatch = UA.match(/version\/\d+.\d+/g);
        }
        else {
            versionMatch = UA.match(new RegExp(name + "\/\\d+.\\d+", "g"));
        }
        
        let versionTokens = versionMatch[0].split("/")[1].split(".");
        version.major = versionTokens[0];
        version.minor = versionTokens[1];

        return version;
    };

    browserUtils.getBrowserInfo = () => {
        return {
            name: browserUtils.getBrowserName(),
            version: browserUtils.getBrowserVersion(),
        };
    };

    return browserUtils;
});

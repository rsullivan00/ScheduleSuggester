/*
 * File: schedules.js
 * Author: Rick Sullivan
 * Date: 30 November 2014
 *
 * This file handles schedule configuration for each major.
 * It constructs an appropriate schedule based on the user's input choices.
 */

var QUARTERS = {
    fall: 0,
    winter: 1,
    spring: 2,
    all: [0, 1, 2]
};

/* Return the appropriate math sequence course. */
function getMath(num) {
    /* Math sequence, in order. */
    var courses = ["math9", "math11", "math12", "math13", "math14", "amth106", "amth108", "math53"];
    /* Hack to remove amth106 and math53 for Web Design majors. */
    if (major == MAJORS.WEB_DESIGN) {
        courses.splice(courses.indexOf("amth106"), 1);
        courses.splice(courses.indexOf("math53"), 1);
    }
    var filteredCourses = [];
    for (var key in courses) {
        var course = courses[key];
        var equiv = "";
        if (course == "amth106")
            equiv = "chem12 envs21";
        /* Check if the user has credit for this course. */
        course = getCourse(course, equiv);
        if (course != COURSES.core)
            filteredCourses.push(course);
    }

    filteredCourses.push(COURSES.core, COURSES.core, COURSES.core);

    return filteredCourses[num];
}

/* Called when the user has credit for a given course.
 * Updates the skipped courses div to be displayed when printing.
 */
function skipCourse(course) {
    var id = course.id;
    var skippedHTML = "<div id='" + id + "' class='skipped col-md-6'>" + course.title + "</div>";

    /* Don't add duplicates. */
    if ($('#' + id).length == 0)
        $('#courses-skipped').append(skippedHTML);

    return COURSES.core;
}

/* Used to insert a core course if the user already has credit for 
 * the course given as a parameter. 
 * Checks for credit for any equivalent courses as well.
 */
function getCourse(courseName, equivCourseList) {
    var selector = '#' + courseName.toUpperCase();
    var course = COURSES[courseName];
    if ($(selector).length) {
        if ($(selector).prop('type') == 'checkbox') { 
            if ($(selector).prop('checked')) {
                return skipCourse(course);
            } 
        } else  {
            /* Else it's a radio button */
            var radioSelector = 'input.credit:radio[name="' + $(selector).prop('name') + '"]:checked';
            if ($(radioSelector).val() >= $(selector).val()) 
                return skipCourse(course);
        }
    }

    if (equivCourseList) {
        /* Check equivalent checkboxes for replacement credit. */
        var equivCourses = equivCourseList.split(' ');
        for (var key in equivCourses) {
            var altSelector = '#' + equivCourses[key].toUpperCase();
             if ($(altSelector).prop('checked')) 
                return skipCourse(course);
        }
    }
    
    return course;
}

/* Greedily inserts the c&i sequence into the schedule. */
function insertCandI(schedule) {
    /* If we have two adjacent core slots, replace with C&I */
    if ($.inArray(COURSES.core, schedule[0]) != -1 && $.inArray(COURSES.core, schedule[1]) != -1) {
        /* Check that C&I is not already in the schedule */
        if ($.inArray(COURSES.ci[0], schedule[0]) == -1 && $.inArray(COURSES.ci[1])) {
            var index = $.inArray(COURSES.core, schedule[0]);
            schedule[0][index] = COURSES.ci[0];
            index = $.inArray(COURSES.core, schedule[1]);
            schedule[1][index] = COURSES.ci[1];
        }
    } else if ($.inArray(COURSES.core, schedule[1]) != -1 && $.inArray(COURSES.core, schedule[2]) != -1) {
        /* Check that C&I is not already in the schedule */
        if ($.inArray(COURSES.ci[0], schedule[1]) == -1 && $.inArray(COURSES.ci[2])) {
            var index = $.inArray(COURSES.core, schedule[1]);
            schedule[1][index] = COURSES.ci[0];
            index = $.inArray(COURSES.core, schedule[2]);
            schedule[2][index] = COURSES.ci[1];
        }
    }

    return schedule;
}

function insertENGR1(schedule) {
    /* Add the ENGR 1 course and the button to change its location */
    if (isEngr1Fall) {
        schedule[0].push(COURSES.engr1);
        schedule[1].push(COURSES.engrButton);
    } else {
        schedule[1].push(COURSES.engr1);
        schedule[0].push(COURSES.engrButton);
    }
}

function coreLocation(schedule, quarter) {
    return $.inArray(COURSES.core, schedule[quarter]);
}

/* Greedily inserts a course into the first core section in the schedule.
 * Takes into account the quarters a course is offered, as well as making
 * sure that the course is not taken along or before any prerequisites.
 */
function insertCourse(schedule, course, quarters, prereq) {
    /* Check for equivalent credit with getCourse function. If there is credit, skip this course. */
    if (getCourse(course.id) == COURSES.core)
        return false;

    var prereqQuarter = -1;
    if (prereq) {
        for (var i = 0; i < 3; i++) {
            if ($.inArray(prereq, schedule[i]) != -1) {
                prereqQuarter = i;
                break;
            }
        }
    }
                
    for (var i = 0; i < quarters.length; i++) {
        var quarter = quarters[i];
        if (quarter <= prereqQuarter)
            continue;
        var core = coreLocation(schedule, quarter);
        if (core != -1) {
            schedule[quarter][core] = course;
            return schedule;
        }
    }

    return false;
}

/* Schedules for each major are created through the following configuration functions. */
var SCHEDULES = {};

SCHEDULES[MAJORS.WEB_DESIGN] = function() {
    var schedule = [
        [COURSES.ctw[0], 
            getMath(0), 
            getCourse('natsci', 'chem11 envs21 chem12'), 
            getCourse('coen10')
        ],
        [COURSES.ctw[1], 
            getMath(1), 
            COURSES.ci[0],
            getCourse('coen11')
        ],
        [COURSES.core, 
            getMath(2), 
            COURSES.ci[1],
            getCourse('coen12')]
    ];

    insertENGR1(schedule);
    insertCourse(schedule, COURSES.coen60, [QUARTERS.fall]);

    insertCourse(schedule, COURSES.comm2, QUARTERS.all);
    insertCourse(schedule, COURSES.comm12, QUARTERS.all);
    insertCourse(schedule, COURSES.comm30, QUARTERS.all);
    insertCourse(schedule, COURSES.soci49, QUARTERS.all);

    return schedule;
};

SCHEDULES[MAJORS.COEN] = function() {
    var schedule = [
        [COURSES.ctw[0], 
            getMath(0), 
            getCourse('chem11', 'chem12 envs21'), 
            getCourse('coen10')
        ],
        [COURSES.ctw[1], 
            getMath(1), 
            getCourse('phys31'),
            getCourse('coen11')
        ],
        [getCourse('coen19'), 
            getMath(2), 
            getCourse('phys32'),
            getCourse('coen12')]
    ];

    insertCandI(schedule);
    insertENGR1(schedule);

    insertCourse(schedule, COURSES.coen20, [QUARTERS.spring], COURSES.coen12);

    return schedule;
};

/* Returns a matrix of Course objects depending on the user's selections. */
var getSchedule = function() { 
    /* Reset skipped courses. */
    $('#courses-skipped').html('');

    var schedule = SCHEDULES[major]();

    return schedule;
};

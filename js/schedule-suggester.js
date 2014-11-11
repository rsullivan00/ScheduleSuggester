var COEN = "COEN";
var WEB_DESIGN = "Web Design and Engineering";
var major = COEN;
var credits;

/* Global flag to track which quarter to put ENGR 1. */
var isEngr1Fall = true;

/* Uses the COURSES and credits objects to return a matrix of Course objects. */
var getSchedule = function() { 
    /* Used to insert a core course if the user already has credit for the course given as a parameter. */
    function getCourse(courseName) {
        var selector = '#' + courseName.toUpperCase();
        if ($(selector).prop('type') == 'checkbox') { 
            if ($(selector).prop('checked')) 
                return COURSES.core;
        } else  {
            /* Else it's a radio button */
            var radioSelector = 'input.credit:radio[name="' + $(selector).prop('name') + '"]:checked';
            if ($(radioSelector).val() >= $(selector).val()) 
                return COURSES.core;
        }
        
        return COURSES[courseName];
    }

    function getMath(num) {
        var courses = ["math9", "math11", "math12", "math13", "math14", "amth106", "amth108", "math53"];
        var filteredCourses = [];
        for (var key in courses) {
            var course = courses[key];
            course = getCourse(course);
            if (course != COURSES.core)
                filteredCourses.push(course);
        }

        filteredCourses.push([COURSES.core, COURSES.core, COURSES.core]);

        return filteredCourses[num];
    }
    
    var schedule = [
        [COURSES.ctw[0], 
            getMath(0), 
            getCourse('chem11'), 
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

    /* Add the ENGR 1 course and the button to change its location */
    if (isEngr1Fall) {
        schedule[0].push(COURSES.engr1);
        schedule[1].push(COURSES.engrButton);
    } else {
        schedule[1].push(COURSES.engr1);
        schedule[0].push(COURSES.engrButton);
    }

    return schedule;
};

/* Gets the up-to-date schedule and draws it to the screen. */
var drawSchedule = function() {
    var schedule = getSchedule();
    for (var i = 0; i < 5; i++) {
        for (var j = 0; j < 3; j++) {
            var course = schedule[j][i];
            if (course) {
                var e = $('#row' + i + ' > td').eq(j).html(course.title);
                e.attr("class", course.type);
            }
        }
    }

    $("#engr1-btn").click(switchEngr1);
};

/* Moves the ENGR 1 location and button by setting global flag. */
var switchEngr1 = function() {
    isEngr1Fall = !isEngr1Fall;
    drawSchedule();
};

/* Resets all credits and UI components to initial states. */
var reset = function() {
    credits = {
        math9: true,
        math11: false,
        math12: false,
        math13: false,
        math14: false,

        coen10: false,
        coen11: false,
        coen12: false,

        phys31: false,
        phys32: false,

        envs21: false,

        chem11: false,
        chem12: false
    };

    /* Uncheck all checkboxes */
    $("input:checkbox").prop('checked', false);

    /* Reset all select elements */
    $("select").val('0');

    /* Reset radio buttons */
    $("input:radio[value='0']").prop('checked', true);

    drawSchedule();
};

/* Called as soon as the sources have loaded and the DOM is ready. 
 * Initializes logic and UI components.
 */
$(document).ready(function() {
    /* Enable custom switch */
    $("[name='major-switch']").bootstrapSwitch();

    /* Bind print button to window.print() */
    $("#print-btn").click(function() {
        window.print();
    });

    /* Reset button just calls the reset function */
    $("#reset-btn").click(function() {
        reset();
    });

    bindSelects();

    bindEquivalentCredit();

    /* Skip COEN 10 if user has programming experience. */
    $('#progExperience').on('change', function(e) {
        var coen = $('input.credit:radio[name="coen"]:checked').val();
        if ($('#csci').val() < THRESHOLDS.csci && !coen)
            credits.coen10 = e.target.checked;

        drawSchedule(); 
    });

    /* Calculus readiness exam */
    $('#calcReadiness').on('change', function() {
        if (!credits.math11) {
            credits.math9 = !credits.math9;
            drawSchedule();
        } else {
            $('#readinessWarning').fadeIn();
            setTimeout(function() {
                $('#readinessWarning').fadeOut();
            }, 10000);
            $('#calcReadiness').prop('checked', false);
        }
    });

    reset();
});

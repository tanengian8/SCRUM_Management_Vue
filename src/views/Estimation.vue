<template>
    <ProjectLayout>
        <div class="estimation">
            <h1>Estimation</h1>
            <h2> If your graph is below x-axis or above total number of estimation efforts, it means you have changed a
                sprint backlog status from "Completed" to
                others.</h2>
            <div class="complete-box-container">
                <h1> Your project is expected to be completed at : <br>
                    <div class="estimation-date-container">{{ completionDate }} </div>
                </h1>
                <br>
                <div class="main-container">
                    <div class="backlog-container">
                        <h1 class='title'>Burndown Chart</h1>
                        <div class="white-box-container" style="background-color:#F5F5F5">
                            <canvas id="OverallBurndownChart" width="400" height="400"></canvas>
                        </div>
                    </div>
                    <div class="point-container">
                        <h1 class="title">Burnup Chart</h1>
                        <div class="white-box-container" style="background-color:#F5F5F5">
                            <canvas id="OverallBurnupnChart" width="400" height="400"></canvas>
                        </div>
                    </div>
                </div>
                <br>
            </div>
            <br>
            <div class="main-container">
                <div class="backlog-container">
                    <h1 class='title'>Backlogs</h1>
                    <div class="white-box-container">
                        <canvas id="backlogChart" width="400" height="400"></canvas>
                    </div>
                </div>
                <div class="point-container">
                    <h1 class="title">Estimation Points</h1>
                    <div class="white-box-container">
                        <canvas id="estimationChart" width="400" height="400"></canvas>
                    </div>
                </div>

            </div>
            <br>
            <div class="sprint-table">

                <h1 class="title">Sprints</h1>
                <div class="title-container">
                    <h2 class="backlog-title" style="color:#2C5282; background-color:#b8d5ef;"> Overall Average
                        Estimation Point Completed per Day : {{ averageEffort }} </h2>
                </div>
                <table class="main-table">
                    <thead>
                        <tr>
                            <th>Backlog Name</th>
                            <th>Completed Estimation Point</th>
                            <th>Remaining Estimation Point</th>
                            <th>Null Backlog Completed</th>
                            <th>Null Backlog Remaining</th>
                            <th> Actual Effort </th>
                            <th> Average Estimation Point Completed per Day </th>
                            <th> Action </th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-for="(estimation, index) in sprints" :key="index">
                            <tr>
                                <td>{{ estimation.description }}</td>
                                <td>{{ estimation.completedEstimation }}</td>
                                <td>{{ estimation.remainingEstimation }}</td>
                                <td>{{ estimation.nullCompleted }}</td>
                                <td>{{ estimation.nullRemaining }}</td>
                                <td>{{ estimation.actualEffort }} day(s)</td>
                                <td>{{ estimation.averageEffort }}</td>
                                <td>
                                    <button class="function-button-blue" @click="toggleDetails(estimation)">
                                        {{ estimation.showDetails ? 'Hide Details' : 'Show Details' }}
                                    </button>
                                </td>
                            </tr>
                            <tr v-show="estimation.showDetails">
                                <td colspan="8">
                                    <div class="main-container">
                                        <div class="backlog-container">
                                            <h1 class='title'>Burndown Chart</h1>
                                            <div class="white-box-container" style="background-color:#F5F5F5">
                                                <canvas :id="'burndownChart' + estimation.id" width="400"
                                                    height="400"></canvas>
                                            </div>
                                        </div>
                                        <div class="point-container">
                                            <h1 class="title">Burnup Chart</h1>
                                            <div class="white-box-container" style="background-color:#F5F5F5">
                                                <canvas :id="'burnupChart' + estimation.id" width="400"
                                                    height="400"></canvas>
                                            </div>
                                        </div>
                                    </div>
                                    <br>
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>
        </div>
        <canvas id="burndownChart" width="400" height="400"></canvas>
    </ProjectLayout>
    <div class="popout-overlay" v-if="isLoading">
        <div class="popout-modal">
            <Loading />
        </div>
    </div>
</template>

<script>
import ProjectLayout from '@/layout/ProjectLayout.vue'
import Loading from '@/components/Loading.vue'
import { Chart } from 'chart.js/auto';

import axios from 'axios';
import { sum } from 'lodash';

export default {
    name: 'Estimation',
    components: {
        ProjectLayout,
        Loading
    },
    data() {
        return {
            productBacklog: [],
            completedBacklog: 0,
            inProgressBacklog: 0,
            toDoBacklog: 0,
            otherBacklog: 0,
            remainingEstimation: 0,
            completedEstimation: 0,
            nullEstimation: 0,
            burndownCharts: {},
            sprints: [],
            averageEffort: 0,
            burnupCharts: {},
            completionDate: "Not Available",
        };
    },

    methods: {
        toggleDetails(estimation) {
            estimation.showDetails = !estimation.showDetails;
        },

        renderBacklogChart() {
            const ctx = document.getElementById('backlogChart').getContext('2d');
            if (this.backlogChart) {
                this.backlogChart.destroy(); // Destroy the existing Chart instance
            }

            this.backlogChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['To Do', 'In Progress', 'Completed', 'Others'],
                    datasets: [{
                        data: [this.toDoBacklog, this.inProgressBacklog, this.completedBacklog, this.otherBacklog],
                        backgroundColor: [
                            'rgba(221, 18, 18, 0.2)',
                            'rgba(221, 107, 32, 0.2)',
                            'rgba(56, 161, 105, 0.2)',
                            'rgba(75, 111, 188, 0.2)'

                        ],
                        borderColor: [
                            'rgba(221, 18, 18, 1)',
                            'rgba(221, 107, 32, 1)',
                            'rgba(56, 161, 105, 1)',
                            'rgba(75, 111, 188, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Sprint Backlog Summary',
                            font: {
                                size: 20, // adjust the size as needed
                                weight: 'bold' // set to 'bold' for bold text
                            }
                        },
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Sprint Backlog Status',
                                font: {
                                    size: 15,
                                    weight: 'bold'
                                }
                            },
                            ticks: {
                                font: {
                                    size: 15,
                                }
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Number of Sprint Backlog(s)',
                                font: {
                                    size: 15,
                                    weight: 'bold'
                                },
                            },
                            ticks: {
                                stepSize: 1, // Set the step size to 1 to show integer values
                                precision: 0, // Remove decimal places
                                font: {
                                    size: 15,

                                }
                            }
                        }
                    }
                }

            });
        },

        renderEstimationChart() {
            const ctx = document.getElementById('estimationChart').getContext('2d');

            if (this.estimationChart) {
                this.estimationChart.destroy(); // Destroy the existing Chart instance
            }

            this.estimationChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Total Estimation with NULL', 'Remaining Estimation', 'Completed Estimation'],
                    datasets: [{
                        data: [this.nullEstimation, this.remainingEstimation, this.completedEstimation],
                        backgroundColor: [
                            'rgba(221, 18, 18, 0.2)', // dd1212 with opacity 0.2
                            'rgba(221, 107, 32, 0.2)', // dd6b20 with opacity 0.2
                            'rgba(56, 161, 105, 0.2)' // 38A169 with opacity 0.2
                        ],
                        borderColor: [
                            'rgba(221, 18, 18, 1)', // dd1212 with opacity 1
                            'rgba(221, 107, 32, 1)', // dd6b20 with opacity 1
                            'rgba(56, 161, 105, 1)' // 38A169 with opacity 1
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Estimation Summary',
                            font: {
                                size: 20, // adjust the size as needed
                                weight: 'bold' // set to 'bold' for bold text
                            }
                        },
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Estimation Status',
                                font: {
                                    size: 15,
                                    weight: 'bold'
                                }
                            },
                            ticks: {
                                font: {
                                    size: 15,
                                }
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Number of Estimation Point(s)',
                                font: {
                                    size: 15,
                                    weight: 'bold'
                                },
                            },
                            ticks: {
                                stepSize: 1, // Set the step size to 1 to show integer values
                                precision: 0, // Remove decimal places
                                font: {
                                    size: 15,

                                }
                            }
                        }
                    }
                },
            });
        },

        renderOverallBurndownChart() {
            let dates = [];
            let sprintDates = [];
            let actualWorkRemaining = [];
            let estimatedWorkRemaining = [];
            let allocatedWorkRemaining = [];

            let sumOfEstimation = this.remainingEstimation + this.completedEstimation;
            //cumulative sum of estimation for start date

            let sumOfEstimationSD = this.remainingEstimation + this.completedEstimation;
            //cumulative sum of estimation for end date

            let sumOfEstimationED = this.remainingEstimation + this.completedEstimation;

            //cumulative sum of estimation for estimation date
            let sumOfEstimationEsD = this.remainingEstimation + this.completedEstimation;

            //cumulative sum of estimation for actual completion date
            let sumOfEstimationAD = this.remainingEstimation + this.completedEstimation;

            let actualWorkRemanining = [];
            let estimatedWorkRemanining = [];
            let allocatedWorkRemanining = [];

            for (let i = 0; i < this.sprints.length; i++) {
                // Pushing the dates along with their date types into the 'dates' array
                dates.push({ dateType: 'startDate', date: this.sprints[i].startDate, effort: sumOfEstimationSD - this.sprints[i].completedEstimation - this.sprints[i].remainingEstimation });
                sumOfEstimationSD -= this.sprints[i].completedEstimation + this.sprints[i].remainingEstimation;
                dates.push({ dateType: 'endDate', date: this.sprints[i].endDate, effort: sumOfEstimationED - this.sprints[i].completedEstimation - this.sprints[i].remainingEstimation });
                sumOfEstimationED -= this.sprints[i].completedEstimation + this.sprints[i].remainingEstimation;
                dates.push({ dateType: 'actualCompletionDate', date: this.sprints[i].actualCompletionDate, effort: sumOfEstimationAD - this.sprints[i].completedEstimation });
                sumOfEstimationAD -= this.sprints[i].completedEstimation;

                if (this.sprints[i].estimatedDate !== null) {
                    dates.push({ dateType: 'estimatedDate', date: this.sprints[i].estimatedDate, effort: sumOfEstimationEsD - this.sprints[i].completedEstimation - this.sprints[i].remainingEstimation });
                    sumOfEstimationEsD -= this.sprints[i].completedEstimation + this.sprints[i].remainingEstimation;
                }

                else {
                    //the first sprint has no estimated date, however, the starting effort of first estimated date is the same as the starting effort of the second sprint (same start date)
                    if (this.sprints.length > 1) {
                        dates.push({ dateType: 'estimatedDate', date: this.sprints[i + 1].startDate, effort: sumOfEstimationEsD - this.sprints[i].completedEstimation - this.sprints[i].remainingEstimation })
                        sumOfEstimationEsD -= this.sprints[i].completedEstimation + this.sprints[i].remainingEstimation;
                    }
                }
            }
            // Sorting the 'dates' array based on the date values
            dates.sort((a, b) => new Date(a.date) - new Date(b.date));

            for (let i = 0; i < dates.length; i++) {
                sprintDates.push(dates[i].date);
                if (dates[i].dateType === 'startDate') {
                    //find first occurance of start date
                    if (i === 0) {
                        allocatedWorkRemaining.push(sumOfEstimation);
                        actualWorkRemaining.push(sumOfEstimation);
                        estimatedWorkRemaining.push(null);

                    } else {
                        //the start date of the first sprint is the same as the estimated date of the second sprint
                        allocatedWorkRemaining.push(dates[i-1].effort);
                        estimatedWorkRemaining.push(null);
                        actualWorkRemaining.push(null);
                    }

                } else if (dates[i].dateType === 'endDate') {
                    allocatedWorkRemaining.push(dates[i].effort);
                    estimatedWorkRemaining.push(null);
                    actualWorkRemaining.push(null);

                } else if (dates[i].dateType === 'actualCompletionDate') {
                    allocatedWorkRemaining.push(null);
                    estimatedWorkRemaining.push(null);
                    actualWorkRemaining.push(dates[i].effort);

                } else if (dates[i].dateType === 'estimatedDate') {
                    allocatedWorkRemaining.push(null);
                    estimatedWorkRemaining.push(dates[i].effort);
                    actualWorkRemaining.push(null);
                }
            }

            // Create a new Chart.js instance
            const ctx = document.getElementById('OverallBurndownChart').getContext('2d');
            this.burndownChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: sprintDates,
                    datasets: [
                        {
                            label: 'Estimated Work Remaining',
                            data: estimatedWorkRemaining,
                            borderColor: 'rgba(221, 18, 18, 0.6)',
                            backgroundColor: 'rgba(221, 18, 18, 0.4)',
                            fill: false,
                            spanGaps: true
                        },
                        {
                            label: 'Actual Work Remaining',
                            data: actualWorkRemaining,
                            borderColor: 'rgba(221, 107, 32, 0.6)',
                            backgroundColor: 'rgba(221, 107, 32, 0.4)',
                            fill: false,
                            spanGaps: true
                        },
                        {
                            label: 'Allocated Work Remaining',
                            data: allocatedWorkRemaining,
                            borderColor: 'rgba(56, 161, 105, 0.6)',
                            backgroundColor: 'rgba(56, 161, 105, 0.4)',
                            fill: false,
                            spanGaps: true
                        },
                    ]
                },
                options: {
                    plugins: {
                        title: {
                            display: true,
                            text: 'Burndown Chart',
                            font: {
                                size: 20,
                                weight: 'bold'
                            }
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Sprint Completion Dates',
                                font: {
                                    size: 15,
                                    weight: 'bold'
                                }
                            },

                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Estimation Point(s)',
                                font: {
                                    size: 15,
                                    weight: 'bold'
                                }

                            },
                            ticks: {
                                beginAtZero: true
                            },

                        }
                    }
                }
            });
        },

        renderBurndownChart(sprintItem) {
            let dates = [];
            let sprintDates = [];
            let actualWorkRemaining = [];
            let estimatedWorkRemaining = [];
            let allocatedWorkRemaining = [];

            if (sprintItem.description !== "Sprint 1") {
                // Pushing the dates along with their date types into the 'dates' array
                dates.push({ dateType: 'startDate', date: sprintItem.startDate });
                dates.push({ dateType: 'endDate', date: sprintItem.endDate });
                dates.push({ dateType: 'actualCompletionDate', date: sprintItem.actualCompletionDate });
                dates.push({ dateType: 'estimatedDate', date: sprintItem.estimatedDate });

                // Sorting the 'dates' array based on the date values
                dates.sort((a, b) => new Date(a.date) - new Date(b.date));

                console.log(dates);

                for (let i = 0; i < dates.length; i++) {
                    sprintDates.push(dates[i].date);

                    if (dates[i].dateType === 'startDate') {
                        actualWorkRemaining.push(sprintItem.remainingEstimation + sprintItem.completedEstimation);
                        estimatedWorkRemaining.push(sprintItem.remainingEstimation + sprintItem.completedEstimation);
                        allocatedWorkRemaining.push(sprintItem.remainingEstimation + sprintItem.completedEstimation);
                    } else if (dates[i].dateType === 'endDate') {
                        actualWorkRemaining.push(null);
                        estimatedWorkRemaining.push(null);
                        allocatedWorkRemaining.push(0);
                    } else if (dates[i].dateType === 'actualCompletionDate') {
                        actualWorkRemaining.push(sprintItem.remainingEstimation);
                        estimatedWorkRemaining.push(null);
                        allocatedWorkRemaining.push(null);
                    } else if (dates[i].dateType === 'estimatedDate') {
                        actualWorkRemaining.push(null);
                        estimatedWorkRemaining.push(0);
                        allocatedWorkRemaining.push(null);
                    }
                }

                // Create a new Chart.js instance
                const ctx = document.getElementById('burndownChart' + sprintItem.id).getContext('2d');

                // Destroy the existing Chart instance if it exists
                let existingChart = this.burndownCharts[sprintItem.id];
                if (existingChart) {
                    existingChart.destroy();
                }

                // Create the new Chart instance
                let newChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: sprintDates,
                        datasets: [
                            {
                                label: 'Estimated Work Remaining',
                                data: estimatedWorkRemaining,
                                borderColor: 'rgba(221, 18, 18, 0.6)',
                                backgroundColor: 'rgba(221, 18, 18, 0.4)',
                                fill: false,
                                spanGaps: true
                            },
                            {
                                label: 'Actual Work Remaining',
                                data: actualWorkRemaining,
                                borderColor: 'rgba(221, 107, 32, 0.6)',
                                backgroundColor: 'rgba(221, 107, 32, 0.4)',
                                fill: false,
                                spanGaps: true
                            },
                            {
                                label: 'Allocated Work Remaining',
                                data: allocatedWorkRemaining,
                                borderColor: 'rgba(56, 161, 105, 0.6)',
                                backgroundColor: 'rgba(56, 161, 105, 0.4)',
                                fill: false,
                                spanGaps: true
                            },
                        ]
                    },
                    options: {
                        plugins: {
                            title: {
                                display: true,
                                text: 'Burndown Chart of ' + sprintItem.description,
                                font: {
                                    size: 20,
                                    weight: 'bold'
                                }
                            }
                        },
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Sprint Completion Dates',
                                    font: {
                                        size: 15,
                                        weight: 'bold'
                                    }
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Estimation Point(s)',
                                    font: {
                                        size: 15,
                                        weight: 'bold'
                                    }
                                },
                                ticks: {
                                    beginAtZero: true
                                }
                            }
                        }
                    }
                });

                // Store the new Chart instance in the burndownCharts object
                this.burndownCharts[sprintItem.id] = newChart;
            }
        },

        renderFirstBurndownChart(sprintItem) {
            let dates = [];
            let sprintDates = [];
            let actualWorkRemaining = [];
            let allocatedWorkRemaining = [];

            if (sprintItem.description === "Sprint 1") {
                // Pushing the dates along with their date types into the 'dates' array
                dates.push({ dateType: 'startDate', date: sprintItem.startDate });
                dates.push({ dateType: 'endDate', date: sprintItem.endDate });
                dates.push({ dateType: 'actualCompletionDate', date: sprintItem.actualCompletionDate });

                // Sorting the 'dates' array based on the date values
                dates.sort((a, b) => new Date(a.date) - new Date(b.date));

                console.log(dates);

                for (let i = 0; i < dates.length; i++) {
                    sprintDates.push(dates[i].date);

                    if (dates[i].dateType === 'startDate') {
                        actualWorkRemaining.push(sprintItem.remainingEstimation + sprintItem.completedEstimation);
                        allocatedWorkRemaining.push(sprintItem.remainingEstimation + sprintItem.completedEstimation);
                    } else if (dates[i].dateType === 'endDate') {
                        actualWorkRemaining.push(null);
                        allocatedWorkRemaining.push(0);
                    } else if (dates[i].dateType === 'actualCompletionDate') {
                        actualWorkRemaining.push(sprintItem.remainingEstimation);
                        allocatedWorkRemaining.push(null);
                    }
                }

                // Create a new Chart.js instance
                const ctx = document.getElementById('burndownChart' + sprintItem.id).getContext('2d');

                // Destroy the existing Chart instance if it exists
                let existingChart = this.burndownCharts[sprintItem.id];
                if (existingChart) {
                    existingChart.destroy();
                }

                // Create the new Chart instance
                let newChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: sprintDates,
                        datasets: [
                            {
                                label: 'Actual Work Remaining',
                                data: actualWorkRemaining,
                                borderColor: 'rgba(221, 107, 32, 0.6)',
                                backgroundColor: 'rgba(221, 107, 32, 0.4)',
                                fill: false,
                                spanGaps: true
                            },
                            {
                                label: 'Allocated Work Remaining',
                                data: allocatedWorkRemaining,
                                borderColor: 'rgba(56, 161, 105, 0.6)',
                                backgroundColor: 'rgba(56, 161, 105, 0.4)',
                                fill: false,
                                spanGaps: true
                            },
                        ]
                    },
                    options: {
                        plugins: {
                            title: {
                                display: true,
                                text: 'Burndown Chart of ' + sprintItem.description,
                                font: {
                                    size: 20,
                                    weight: 'bold'
                                }
                            }
                        },
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Sprint Completion Dates'
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Estimation Point(s)'
                                },
                                ticks: {
                                    beginAtZero: true
                                }
                            }
                        }
                    }
                });

                // Store the new Chart instance in the burndownCharts object
                this.burndownCharts[sprintItem.id] = newChart;
            }
        },

        renderOverallBurnupChart() {
            let dates = [];
            let sprintDates = [];
            let actualWorkDone = [];
            let estimatedWorkDone = [];
            let allocatedWorkDone = [];

            let sumOfEstimation = this.remainingEstimation + this.completedEstimation;
            //cumulative sum of estimation for start date

            let cumulativeSumSD = 0;
            //cumulative sum of estimation for end date

            let cumulativeSumED = 0;

            //cumulative sum of estimation for estimation date
            let cumulativeSumEsD = 0;

            //cumulative sum of estimation for actual completion date
            let cumulativeSumAD = 0;



            for (let i = 0; i < this.sprints.length; i++) {
                // Pushing the dates along with their date types into the 'dates' array
                dates.push({ dateType: 'startDate', date: this.sprints[i].startDate, effort: cumulativeSumSD + this.sprints[i].completedEstimation + this.sprints[i].remainingEstimation });
                cumulativeSumSD += this.sprints[i].completedEstimation + this.sprints[i].remainingEstimation;
                dates.push({ dateType: 'endDate', date: this.sprints[i].endDate, effort: cumulativeSumED + this.sprints[i].completedEstimation + this.sprints[i].remainingEstimation });
                cumulativeSumED += this.sprints[i].completedEstimation + this.sprints[i].remainingEstimation;
                dates.push({ dateType: 'actualCompletionDate', date: this.sprints[i].actualCompletionDate, effort: cumulativeSumAD + this.sprints[i].completedEstimation });
                cumulativeSumAD += this.sprints[i].completedEstimation;

                if (this.sprints[i].estimatedDate !== null) {
                    dates.push({ dateType: 'estimatedDate', date: this.sprints[i].estimatedDate, effort: cumulativeSumEsD + this.sprints[i].completedEstimation + this.sprints[i].remainingEstimation });
                    cumulativeSumEsD += this.sprints[i].completedEstimation + this.sprints[i].remainingEstimation;
                }

                else {
                    if (this.sprints.length > 1) {
                        //the first sprint has no estimated date, however, the starting effort of first estimated date is the same as the starting effort of the second sprint (same start date)
                        dates.push({ dateType: 'estimatedDate', date: this.sprints[i + 1].startDate, effort: cumulativeSumEsD + this.sprints[i].completedEstimation + this.sprints[i].remainingEstimation })
                        cumulativeSumEsD += this.sprints[i].completedEstimation + this.sprints[i].remainingEstimation;
                    }
                }
            }
            // Sorting the 'dates' array based on the date values
            dates.sort((a, b) => new Date(a.date) - new Date(b.date));

            for (let i = 0; i < dates.length; i++) {
                sprintDates.push(dates[i].date);
                if (dates[i].dateType === 'startDate') {
                    //find first occurance of start date
                    if (i === 0) {
                        allocatedWorkDone.push(0);
                        actualWorkDone.push(0);
                        estimatedWorkDone.push(null);

                    } else {
                        //the start date of the first sprint is the same as the estimated date of the second sprint
                        allocatedWorkDone.push(dates[i-1].effort);
                        estimatedWorkDone.push(null);
                        actualWorkDone.push(null);
                    }

                } else if (dates[i].dateType === 'endDate') {
                    allocatedWorkDone.push(dates[i].effort);
                    estimatedWorkDone.push(null);
                    actualWorkDone.push(null);

                } else if (dates[i].dateType === 'actualCompletionDate') {
                    allocatedWorkDone.push(null);
                    estimatedWorkDone.push(null);
                    actualWorkDone.push(dates[i].effort);

                } else if (dates[i].dateType === 'estimatedDate') {
                    allocatedWorkDone.push(null);
                    estimatedWorkDone.push(dates[i].effort);
                    actualWorkDone.push(null);
                }
            }

            // Create a new Chart.js instance
            const ctx = document.getElementById('OverallBurnupnChart').getContext('2d');
            this.burnupChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: sprintDates,
                    datasets: [
                        {
                            label: 'Estimated Work Done',
                            data: estimatedWorkDone,
                            borderColor: 'rgba(221, 18, 18, 0.6)',
                            backgroundColor: 'rgba(221, 18, 18, 0.4)',
                            fill: false,
                            spanGaps: true
                        },
                        {
                            label: 'Actual Work Done',
                            data: actualWorkDone,
                            borderColor: 'rgba(221, 107, 32, 0.6)',
                            backgroundColor: 'rgba(221, 107, 32, 0.4)',
                            fill: false,
                            spanGaps: true
                        },
                        {
                            label: 'Allocated Work Done',
                            data: allocatedWorkDone,
                            borderColor: 'rgba(56, 161, 105, 0.6)',
                            backgroundColor: 'rgba(56, 161, 105, 0.4)',
                            fill: false,
                            spanGaps: true
                        },
                    ]
                },
                options: {
                    plugins: {
                        title: {
                            display: true,
                            text: 'Burnup Chart',
                            font: {
                                size: 20,
                                weight: 'bold'
                            }
                        }
                    },

                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Sprint Completion Dates',
                                font: {
                                    size: 15,
                                    weight: 'bold'
                                }
                            },

                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Estimation Point(s)',
                                font: {
                                    size: 15,
                                    weight: 'bold'
                                }

                            },
                            ticks: {
                                beginAtZero: true
                            },

                        }
                    }
                }
            });
        },

        renderBurnupChart(sprintItem) {
            let dates = [];
            let sprintDates = [];
            let actualWorkDone = [];
            let estimatedWorkDone = [];
            let allocatedWorkDone = [];

            if (sprintItem.description !== "Sprint 1") {
                // Pushing the dates along with their date types into the 'dates' array
                dates.push({ dateType: 'startDate', date: sprintItem.startDate });
                dates.push({ dateType: 'endDate', date: sprintItem.endDate });
                dates.push({ dateType: 'actualCompletionDate', date: sprintItem.actualCompletionDate });
                dates.push({ dateType: 'estimatedDate', date: sprintItem.estimatedDate });

                // Sorting the 'dates' array based on the date values
                dates.sort((a, b) => new Date(a.date) - new Date(b.date));
                //get only the unique one
                dates = dates.filter((date, index, self) =>
                    index === self.findIndex((t) => (
                        t.date === date.date
                    ))
                )

                for (let i = 0; i < dates.length; i++) {
                    sprintDates.push(dates[i].date);

                    if (dates[i].dateType === 'startDate') {
                        actualWorkDone.push(0);
                        estimatedWorkDone.push(0);
                        allocatedWorkDone.push(0);
                    } else if (dates[i].dateType === 'endDate') {
                        actualWorkDone.push(null);
                        estimatedWorkDone.push(null);
                        allocatedWorkDone.push(sprintItem.completedEstimation + sprintItem.remainingEstimation);
                    } else if (dates[i].dateType === 'actualCompletionDate') {
                        actualWorkDone.push(sprintItem.completedEstimation);
                        estimatedWorkDone.push(null);
                        allocatedWorkDone.push(null);
                    } else if (dates[i].dateType === 'estimatedDate') {
                        actualWorkDone.push(null);
                        estimatedWorkDone.push(sprintItem.completedEstimation + sprintItem.remainingEstimation);
                        allocatedWorkDone.push(null);
                    }
                }
                // Create a new Chart.js instance
                const ctx = document.getElementById('burnupChart' + sprintItem.id).getContext('2d');

                // Destroy the existing Chart instance if it exists
                let existingChart = this.burnupCharts[sprintItem.id];
                if (existingChart) {
                    existingChart.destroy();
                }

                // Create the new Chart instance
                let newChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: sprintDates,
                        datasets: [
                            {
                                label: 'Estimated Work Done',
                                data: estimatedWorkDone,
                                borderColor: 'rgba(221, 18, 18, 0.6)',
                                backgroundColor: 'rgba(221, 18, 18, 0.4)',
                                fill: false,
                                spanGaps: true
                            },
                            {
                                label: 'Actual Work Done',
                                data: actualWorkDone,
                                borderColor: 'rgba(221, 107, 32, 0.6)',
                                backgroundColor: 'rgba(221, 107, 32, 0.4)',
                                fill: false,
                                spanGaps: true
                            },
                            {
                                label: 'Allocated Work Done',
                                data: allocatedWorkDone,
                                borderColor: 'rgba(56, 161, 105, 0.6)',
                                backgroundColor: 'rgba(56, 161, 105, 0.4)',
                                fill: false,
                                spanGaps: true
                            },
                        ]
                    },
                    options: {
                        plugins: {
                            title: {
                                display: true,
                                text: 'Burnup Chart of ' + sprintItem.description,
                                font: {
                                    size: 20,
                                    weight: 'bold'
                                }
                            }
                        },
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Sprint Completion Dates'
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Estimation Point(s)'
                                },
                                ticks: {
                                    beginAtZero: true
                                }
                            }
                        }
                    }
                });

                // Store the new Chart instance in the burndownCharts object
                this.burnupCharts[sprintItem.id] = newChart;
            }
        },

        renderFirstBurnupChart(sprintItem) {
            let dates = [];
            let sprintDates = [];
            let actualWorkDone = [];
            let allocatedWorkDone = [];

            if (sprintItem.description === "Sprint 1") {
                // Pushing the dates along with their date types into the 'dates' array
                dates.push({ dateType: 'startDate', date: sprintItem.startDate });
                dates.push({ dateType: 'endDate', date: sprintItem.endDate });
                dates.push({ dateType: 'actualCompletionDate', date: sprintItem.actualCompletionDate });

                // Sorting the 'dates' array based on the date values
                dates.sort((a, b) => new Date(a.date) - new Date(b.date));

                for (let i = 0; i < dates.length; i++) {
                    sprintDates.push(dates[i].date);

                    if (dates[i].dateType === 'startDate') {
                        actualWorkDone.push(0);
                        allocatedWorkDone.push(0);
                    } else if (dates[i].dateType === 'endDate') {
                        actualWorkDone.push(null);
                        allocatedWorkDone.push(sprintItem.completedEstimation + sprintItem.remainingEstimation);
                    } else if (dates[i].dateType === 'actualCompletionDate') {
                        actualWorkDone.push(sprintItem.completedEstimation);
                        allocatedWorkDone.push(null);
                    }
                }
                // Create a new Chart.js instance
                const ctx = document.getElementById('burnupChart' + sprintItem.id).getContext('2d');

                // Destroy the existing Chart instance if it exists
                let existingChart = this.burnupCharts[sprintItem.id];
                if (existingChart) {
                    existingChart.destroy();
                }

                // Create the new Chart instance
                let newChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: sprintDates,
                        datasets: [
                            {
                                label: 'Actual Work Done',
                                data: actualWorkDone,
                                borderColor: 'rgba(221, 107, 32, 0.6)',
                                backgroundColor: 'rgba(221, 107, 32, 0.4)',
                                fill: false,
                                spanGaps: true
                            },
                            {
                                label: 'Allocated Work Done',
                                data: allocatedWorkDone,
                                borderColor: 'rgba(56, 161, 105, 0.6)',
                                backgroundColor: 'rgba(56, 161, 105, 0.4)',
                                fill: false,
                                spanGaps: true
                            },
                        ]
                    },
                    options: {
                        plugins: {
                            title: {
                                display: true,
                                text: 'Burnup Chart of ' + sprintItem.description,
                                font: {
                                    size: 20,
                                    weight: 'bold'
                                }
                            }
                        },
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Sprint Completion Dates'
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Estimation Point(s)'
                                },
                                ticks: {
                                    beginAtZero: true
                                }
                            }
                        }
                    }
                });

                // Store the new Chart instance in the burndownCharts object
                this.burnupCharts[sprintItem.id] = newChart;
            }
        },

        async getBacklogs() {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/getProductBacklog', {
                    params: {
                        projectID: this.currentProject,
                    },
                });

                if (response.status === 200) {
                    if (response.data.productBacklog) {
                        this.productBacklog = response.data.productBacklog;
                        //for each productbacklog push empty array to sprintbacklog
                        this.productBacklog.forEach(backlog => {
                            backlog.sprintBacklog = [];
                        });
                    }
                    if (response.data.sprintBacklog) {
                        // Loop through the sprint backlog
                        for (let i = 0; i < response.data.sprintBacklog.length; i++) {

                            // Find the index of the product backlog
                            const index = this.productBacklog.findIndex(backlog => backlog.id === response.data.sprintBacklog[i][0].productBacklogID);

                            // If corresponding product backlog is found
                            if (index !== -1) {
                                // Push each sprint backlog item to the sprint backlog array of the corresponding product backlog
                                for (let j = 0; j < response.data.sprintBacklog[i].length; j++) {
                                    const sprintBacklogItem = response.data.sprintBacklog[i][j];
                                    // Check if currentSprint is null and assign "-" if it is, otherwise use the value from sprintBacklogItem
                                    const currentSprint = sprintBacklogItem.sprintID === null ? "-" : sprintBacklogItem.sprintID;
                                    const estimation = sprintBacklogItem.estimation === 0 ? "-" : sprintBacklogItem.estimation;

                                    if (sprintBacklogItem.status === "To Do") {
                                        this.toDoBacklog++;
                                    } else if (sprintBacklogItem.status === "In Progress") {
                                        this.inProgressBacklog++;
                                    } else if (sprintBacklogItem.status === "Completed") {
                                        this.completedBacklog++;
                                    } else {
                                        this.otherBacklog++;
                                    }

                                    if (sprintBacklogItem.estimation === 0) {
                                        this.nullEstimation++;
                                    }

                                    else if (sprintBacklogItem.estimation !== 0 && sprintBacklogItem.status === "Completed") {
                                        this.completedEstimation += sprintBacklogItem.estimation;
                                    }

                                    else if (sprintBacklogItem.estimation !== 0 && sprintBacklogItem.status !== "Completed") {
                                        this.remainingEstimation += sprintBacklogItem.estimation;
                                    }

                                    // Check if sprint is null and assign "-" if it is, otherwise use the value from sprintBacklogItem
                                    const sprint = sprintBacklogItem.sprintInvovled === null ? "-" : sprintBacklogItem.sprintInvovled;
                                    this.productBacklog[index].sprintBacklog.push({
                                        id: sprintBacklogItem.id,
                                        productBacklogID: sprintBacklogItem.productBacklogID,
                                        description: sprintBacklogItem.description,
                                        category: sprintBacklogItem.category,
                                        priority: sprintBacklogItem.priority,
                                        status: sprintBacklogItem.status,
                                        estimation: estimation,
                                        estimationUnit: sprintBacklogItem.estimationUnit,
                                        assignedTo: sprintBacklogItem.assignedTo,
                                        sprintID: currentSprint,
                                        sprintInvovled: sprint,
                                    });
                                }
                            }
                        }
                    }
                }
            }
            catch (error) {
                alert(error);
            }
        },

        async getSprint() {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/getSprint', {
                    params: {
                        projectID: this.currentProject,
                    },
                });

                if (response.status === 200) {
                    this.sprints = [];
                    if (response.data.sprint) {
                        response.data.sprint.forEach(sprint => {
                            if (sprint.status === "Completed") {
                                //append into this.sprints
                                this.sprints.push(sprint);
                            }
                        });

                        let sumOfActualEffort = 0;
                        let sumOfCompletedEstimation = 0;

                        console.log(response.data.sprint);
                        this.sprints.forEach(sprint => {
                            sprint.showDetails = false;

                            //start date + the actual effort, and make this variable as actualCompletionDate
                            // Assuming sprint.startDate is already in date format and sprint.actualEffort is an integer
                            let startDate = new Date(sprint.startDate);
                            let actualCompletionDate = new Date(startDate); // Create a copy of the startDate

                            // Add the actual effort (in days) to the startDate
                            actualCompletionDate.setDate(startDate.getDate() + sprint.actualEffort);

                            // Convert the date to ISO string format and extract the date part
                            sprint.actualCompletionDate = actualCompletionDate.toISOString().split('T')[0];

                            sumOfActualEffort += sprint.actualEffort;
                            sumOfCompletedEstimation += sprint.completedEstimation;
                        });

                        this.averageEffort = (sumOfCompletedEstimation / sumOfActualEffort).toFixed(4);
                    }
                }
            } catch (error) {
                alert(error);
            }
        },

        async getCompletionDate() {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/getCompletionDate', {
                    params: {
                        projectID: this.currentProject,
                    },
                });

                if (response.status === 200) {
                    if (response.data.completionDate) {
                        this.completionDate = response.data.completionDate;
                    }
                }
            } catch (error) {
                alert(error);
            }
        },
    },

    created() {
        this.getCompletionDate();
        this.getSprint();
        //get backlog then render chart
        this.getBacklogs().then(() => {
            this.renderBacklogChart();
            this.renderEstimationChart();
            for (let i = 0; i < this.sprints.length; i++) {
                this.renderBurndownChart(this.sprints[i]);
                this.renderBurnupChart(this.sprints[i]);

                if (this.sprints[i].description === "Sprint 1") {
                    this.renderFirstBurndownChart(this.sprints[i]);
                    this.renderFirstBurnupChart(this.sprints[i]);
                }
            }
            this.renderOverallBurndownChart();
            this.renderOverallBurnupChart();


        },
        );
    },
};
</script>



<style scoped>
.title {
    text-align: left;
    font-size: 25px;
    padding-left: 10px;
    color: #0E1D3D;
    text-decoration: underline;
}

.main-container {
    display: flex;
    justify-content: space-around;
}

.backlog-container,
.point-container {
    width: 100%;
}

.backlog-container {
    padding-right: 20px;
}

.white-box-container {
    background-color: white;
    border-radius: 15px;
    padding: 10px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: center;
    margin-top: 10px;
}

.complete-box-container {
    background-color: #fff;
    padding: 20px;
    margin: 10px;
    border: none;
    border-radius: 15px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

.to-do-container,
.in-progress-container,
.completed-container,
.remaining-container,
.completed-container,
.estimatation-container,
.total-null-container {
    padding: 20px;
    margin: 10px;
    border: none;
    border-radius: 4px;
    background-color: #f1f1f3;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

.title-container {
    display: flex;
    justify-content: center;
    padding-bottom: 10px;
}

.estimation-date-container {

    justify-content: center;
    padding-bottom: 10px;
    background-color: #0E1D3D;
    color: white;
    padding: 5px;
    margin-left: 635px;
    width: 20%;
    align-items: center;
    border-radius: 15px;
    font-size: 35px;
}
</style>

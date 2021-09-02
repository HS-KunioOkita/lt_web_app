<template>
  <v-app>
    <div class="contents">
      <h2 class="heading16">くじ引き</h2>

      <div class="tableContainerWrapper">
        <div class="tableContainer">
          <!-- LT実施履歴 -->
          <v-data-table
            class="vue_tbl implementationHistory"
            :items="allLTHistory"
            sort-by="index"
            :headers="headers"
            :loading="loading"
            :footer-props="{
              'items-per-page-options': [10, 30, 50, 100, -1]
            }"
            :options="{
              itemsPerPage: -1
            }"
            @contextmenu:row="openMenu"
            @contextmenu:row.prevent=""
          >
            <template v-slot:top>
              <v-toolbar flat color="white">
                <v-toolbar-title>LT実施履歴</v-toolbar-title>
                <v-divider
                  class="mx-4"
                  inset
                  vertical
                ></v-divider>
                <v-spacer></v-spacer>
                <v-btn
                  icon
                  v-on:click="addLTHistory({})"
                  :disabled="loading"
                >
                  <v-icon
                    color="primary"
                    size="40"
                  >
                    mdi-plus-circle
                  </v-icon>
                </v-btn>
                <div class="lotteryButton">
                  <v-btn
                    class="info"
                    @click="openLotteryDialog"
                  >
                    抽選
                  </v-btn>
                </div>
              </v-toolbar>
            </template>
            <template v-slot:[`item.date`]="{ item }">
              <DatePickerEditDialog
                v-model="item.date"
                :save="saveLTHistory.bind(this, item)"
                :open="operateEditDialog.bind(this, item, {
                  date: $store.state.user.uid
                })"
                :close="operateEditDialog.bind(this, item, {
                  date: null
                })"
                :disabled="isDisabledEditDialog(item.editing.date)"
              />
            </template>
            <template
              v-for="i in detailCounts"
              v-slot:[`item.details${i}Uid`]="{ item }"
            >
              <SelectFieldEditDialog
                :key="i"
                v-model="item.details[i].uid"
                :text="findUserName(item.details[i].uid)"
                :items="getUserListForSelect()"
                itemText="name"
                itemValue="uid"
                :save="saveLTHistory.bind(this, item)"
                :open="operateDetailsEditDialog.bind(this, item, i, 'uid', $store.state.user.uid)"
                :close="operateDetailsEditDialog.bind(this, item, i, 'uid', null)"
                :disabled="isDisabledEditDialog(item.editing.details[i].uid)"
              />
            </template>
            <template
              v-for="i in detailCounts"
              v-slot:[`item.details${i}Contents`]="{ item }"
            >
              <TextFieldEditDialog
                :key="i"
                v-model="item.details[i].contents"
                name="発表内容"
                rules="contents"
                :save="saveLTHistory.bind(this, item)"
                :open="operateDetailsEditDialog.bind(this, item, i, 'contents', $store.state.user.uid)"
                :close="operateDetailsEditDialog.bind(this, item, i, 'contents', null)"
                :disabled="isDisabledEditDialog(item.editing.details[i].contents)"
              />
            </template>
          </v-data-table>

          <!-- 実施回数や最終実施日時を表示するスペース -->
          <div class="implementationsData">
            <v-row align="center">
              <v-col cols="11" sm="11" md="5">
                <DatePicker
                  v-model="lotteryStartDate"
                  label="対象期間"
                  width="100px"
                  :disabled="loading"
                  :onClose="initUserDataList"
                />
              </v-col>
              <v-col cols="11" sm="11" md="1">〜</v-col>
              <v-col cols="11" sm="11" md="5">
                <DatePicker
                  v-model="lotteryEndDate"
                  label="対象期間"
                  width="100px"
                  :disabled="loading"
                  :onClose="initUserDataList"
                />
              </v-col>
              <v-col cols="10" sm="10" md="10">
                <table class="vue_tbl numberOfImplementations">
                  <tr>
                    <th class="skipCell">スキップ</th>
                    <th class="nameCell">名前</th>
                    <th class="countCell">回数</th>
                    <th class="dateCell">最終実施</th>
                  </tr>
                  <tr v-for="userData in userDataList" :key="userData.user.name">
                    <td>
                      <input type="checkbox" v-model="userData.checked" />
                    </td>
                    <td>{{ userData.user.name }}</td>
                    <td>{{ userData.numOfPresentations }}</td>
                    <td>{{ userData.lastDateTxt }}</td>
                  </tr>
                </table>
              </v-col>
            </v-row>
          </div>
        </div>
      </div>
    </div>

    <!-- 抽選画面 -->
    <v-dialog
      v-model="lotteryDialog"
      width="1000px"
      persistent
    >
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ lotteryTitle }}</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <div class="lotteryOptions">
              <v-row align="center" justify="end">
                <v-col cols="4" sm="4" md="2">
                  <div class="numOfPresenters">
                    <span class="numOfPresentersLabel">抽選者数</span>
                    <NumberField
                      v-model="numOfPresenters"
                      :min="1"
                      :max="maxNumOfPresenters"
                      :step="1"
                      :integer-only="true"
                      :disabled="stillChoosing"
                    />
                  </div>
                </v-col>
                <v-col cols="4" sm="4" md="3">
                  <DatePicker
                    v-model="implementationLTDate"
                    label="実施日時"
                    width="100px"
                    :disabled="stillChoosing"
                  />
                </v-col>
              </v-row>
            </div>

            <Chart
              :chartData="chartData"
              :chartOptions="chartOptions"
              :height="userDataList.length * 10"
            />
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="info darken-1"
            text
            :disabled="stillChoosing"
            @click="closeLotteryDialog"
          >Cancel</v-btn>
          <v-btn
            color="info darken-1"
            text
            :disabled="stillChoosing"
            @click="drawLots"
          >抽選</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 抽選結果画面 -->
    <v-dialog
      v-model="resultScreen"
      width="560px"
      persistent>
      <v-card height="400px">
        <v-card-title>
          <span class="resultTitle">
            {{ implementationLTDateDefaultTxt }} のLT担当が決定しました
          </span>
          <div class="resultBorder borderTop" />
          <div class="resultBorder borderLeft" />
          <div class="resultBorder borderRight" />
          <div class="resultBorder borderBottom" />
        </v-card-title>
        <v-card-text>
          <v-container>
            <div class="lineContainer" :style="inputCssVars" />
            <div class="resultScreen">
              <div v-for="(target, i) in targetList" :key="i">
                <div
                  class="targetName"
                  :style="'font-size: ' + Math.max(200 - i * 40, 80) + '%;' + (i == 0 ? 'color: red;' : 'color: blue;')"
                >
                  {{i + 1}}. {{ findUserName(target) }}
                </div>
              </div>
            </div>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <div class="resultButtons">
            <v-btn color="info darken-1" text @click="closeResultScreen">Cancel</v-btn>
            <v-btn color="info darken-1" text @click="saveNextUsers">Save</v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 上書き確認ダイアログ -->
    <v-dialog
      v-model="checkOverwriteDialog"
      width="300px"
      persistent>
      <v-card>
        <v-card-title>
          注意
        </v-card-title>
        <v-card-text>
          <v-container>
            <span>{{ implementationLTDateDefaultTxt }} にはすでに実施履歴があります。</span>
            <span>上書きしますか？</span>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="info darken-1" text @click="closeOverwriteDialog">Cancel</v-btn>
          <v-btn color="info darken-1" text @click="overwriteLTHistory">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 右クリック時のメニュー -->
    <ContextMenu id="context-menu" ref="ctxMenu">
      <li @click="insertOnLTHistory()">上に挿入</li>
      <li @click="insertBelowLTHistory()">下に挿入</li>
      <li @click="deleteLTHistory()">削除</li>
    </ContextMenu>
  </v-app>
</template>

<script>
import { User } from '@/models/user'
import { LTHistory } from '@/models/ltHistory'
import Chart from '@/components/ui/BarChart.js'
import {
  DAY,
  convertStringFromDate,
  sleep,
  isDate,
  calculateDay,
  addRankingAllowSameRank,
  convertDateFromString,
  getLastDate,
  getDay,
  compareDate,
  logger,
  printJson
} from '@/libs/utils'
import Sortable from 'sortablejs'

const NOMAL_BAR_COLOR = 'rgba(54, 162, 235, 0.2)' // 棒グラフの色
const TARGET_BAR_COLOR = 'red' // 当選者の棒グラフの色
const TITLE_LOTTERY = '次のLT担当を抽選します'
const TITLE_CHOOSING = '次のLT担当を指名中...'
const MAX_SCORE = 100 // スコアの最大値
const NEXT_INTERVAL = 30 // days

export default {
  components: {
    Chart
  },
  data: () => ({
    loading: false,
    lotteryDialog: false,
    lotteryTitle: TITLE_LOTTERY,
    numOfPresenters: 0,
    maxNumOfPresenters: 0,
    implementationLTDate: null,
    lotteryStartDate: null,
    lotteryEndDate: null,
    stillChoosing: false,
    resultScreen: false,
    checkOverwriteDialog: false,
    overwriteLTHistory: () => {},
    allUserList: [],
    userDataList: [],
    userDataListToDraw: [],
    headers: [],
    allLTHistory: [],
    detailCounts: [],
    defaultScoreList: [],
    targetList: [],
    selectLTHistory: null,
    max10chars: v => v.length <= 10 || 'Input too long!',
    max30chars: v => v.length <= 30 || 'Input too long!',
    chartData: {},
    chartOptions: {
      animation: false,
      legend: {
        display: false
      },
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        xAxes: [
          {
            ticks: {
              max: MAX_SCORE,
              min: 0
            },
            display: false
          }
        ]
      }
    },
    circleWidth: '150vw',
    halfCircleWidth: '',
    ltHistoryListnerInitialized: false,
    userListnerInitialized: false,
    ltHistoryListner: null,
    userListner: null,
    hasNotification: false,
    myOperation: false
  }),

  computed: {
    inputCssVars () {
      return {
        '--circle-width': this.circleWidth,
        '--half-circle-width': this.halfCircleWidth,
        '--border-color': '#ffab3c'
      }
    },

    implementationLTDateDefaultTxt: {
      get () {
        return convertStringFromDate(this.implementationLTDate)
      },
      set (dateTxt) {
        this.implementationLTDate = convertDateFromString(dateTxt)
      }
    }
  },

  async created () {
    this.loadingDialog.open()

    await this.initOnSnapShots()
    await this.initialize()
    this.initChartOptions()

    this.loadingDialog.close()
  },

  mounted () {
    // LT実施履歴の並び替えを実装
    this.$nextTick(function () {
      // LT実施履歴のテーブルボディを取得
      let table = document.querySelector('.implementationHistory.v-data-table tbody')
      const self = this

      // LT実施履歴を並び替え可能にする
      Sortable.create(table, {
        async onEnd ({ newIndex, oldIndex }) {
          if (newIndex === oldIndex) {
            // 移動がなかった場合は無視
            return
          }

          self.loadingDialog.open()

          // 現在位置より上に移動したかどうか
          const isUp = newIndex < oldIndex

          // ドラッグした履歴
          const item = self.allLTHistory.find(x => x.index === oldIndex)
          // ドラッグしたことによって位置がズレる履歴を抽出する
          const itemList = self.allLTHistory.filter(x => {
            if (isUp) {
              return x.index >= newIndex && x.index < oldIndex
            } else {
              return x.index > oldIndex && x.index <= newIndex
            }
          })

          // 移動した分他のデータをずらす
          for (var item_ of itemList) {
            item_.update({
              index: item_.index + (isUp ? 1 : -1)
            })
          }
          // indexを更新
          // self.loadingDialog.open()の処理が完了する前にclose()が呼ばれエラー発生するためawait
          await item.update({
            index: newIndex
          })

          self.loadingDialog.close()
        }
      })
    })
  },

  methods: {
    /**
     * 初期化処理
     */
    async initialize () {
      this.loading = true

      // データ初期設定
      await this.initAllLTHistory()
      await this.initUserDataList()
      this.initImplementationLTDate()
      this.initChartData()

      // 抽選画面の初期設定のため、デフォルトのスコアリストを設定しておく
      this.defaultScoreList = this.userDataList.map((x) => {
        return {
          uid: x.user.uid,
          score: 0
        }
      })
      this.numOfPresenters = this.$store.state.ltSettings.numOfPresenters
      this.maxNumOfPresenters = this.$store.state.ltSettings.numOfPresenters

      this.loading = false
    },
    /**
     * ユーザーデータ初期処理
     */
    async initUserDataList () {
      // 全ユーザー情報を取得
      const allUserList = await User.getAllUsers()

      // LT実施者リストを作成する
      var userDataList = []
      for (let i = 0; i < allUserList.length; i++) {
        const user = allUserList[i]

        if (user.disableFlg) {
          // 無効なアカウントは含めない
          continue
        }

        // LT実施履歴からユーザーの最終実施日時を取得する
        const userLTHistory = this.allLTHistory.filter((x) => {
          // ユーザーの実施履歴かどうか確認
          var isUser = false
          for (var detail of x.details) {
            isUser = detail.uid === user.uid
            if (isUser) {
              // ユーザーの実施履歴がある場合はループを抜ける
              break
            }
          }

          // 指定された対象期間内の記録のみ集計する
          var isTargetPeriod = true
          if (isDate(this.lotteryStartDate)) {
            isTargetPeriod = isTargetPeriod && (x.date >= this.lotteryStartDate)
          }
          if (isDate(this.lotteryStartDate)) {
            isTargetPeriod = isTargetPeriod && (x.date <= this.lotteryEndDate)
          }
          return isUser && isTargetPeriod
        })

        // 実施回数を取得
        const numOfPresentations = userLTHistory.length
        // 実施履歴がない場合はnullを渡す
        var lastDate = null
        if (numOfPresentations > 0) {
          // 日時のみの配列を生成
          const dateHistory = userLTHistory.map((x) => {
            return x.date
          })
          // 最終実施日時を取得
          lastDate = getLastDate(dateHistory)
        }

        const userData = {
          user: user,
          numOfPresentations: numOfPresentations,
          lastDate: lastDate,
          lastDateTxt: convertStringFromDate(lastDate),
          checked: false
        }
        userDataList.push(userData)
      }
      this.allUserList = allUserList
      this.userDataList = userDataList
    },
    /**
     * LT履歴初期処理
     */
    async initAllLTHistory () {
      const allLTHistory = await LTHistory.getAllHistory()

      this.detailCounts = [...Array(this.$store.state.ltSettings.numOfPresenters)].map((_, x) => x)

      this.allLTHistory = allLTHistory.map((x) => {
        // 実施者数が最大実施者数に満たない場合は空データを入れておく
        const detailsLengthDiff = this.$store.state.ltSettings.numOfPresenters - x.details.length
        for (var i = 0; i < detailsLengthDiff; i++) {
          x.details.push({
            uid: '',
            contents: ''
          })
        }
        // 同様に編集データも初期化する
        const editingDetailsLengthDiff = this.$store.state.ltSettings.numOfPresenters - x.editing.details.length
        for (var j = 0; j < editingDetailsLengthDiff; j++) {
          x.editing.details.push({
            uid: null,
            contents: null
          })
        }

        return x
      })

      // LT実施履歴のヘッダー設定
      this.headers = [
        {
          text: '日付',
          value: 'date',
          width: '120px',
          align: 'center',
          sortable: false
        }
      ]
      // 実施者数分のヘッダーを設定する
      for (var i = 0; i < this.$store.state.ltSettings.numOfPresenters; i++) {
        this.headers.push({
          text: `プレゼンター${i + 1}`,
          value: `details${i}Uid`,
          width: '150px',
          align: 'center',
          sortable: false
        })
        this.headers.push({
          text: '内容',
          value: `details${i}Contents`,
          width: '300px',
          align: 'center',
          sortable: false
        })
      }
    },
    /**
     * グラフのオプション初期処理
     */
    initChartOptions () {
      const startDateData = this.getMinDateData(this.allLTHistory, 'date')
      const endDateData = this.getMaxDateData(this.allLTHistory, 'date')

      this.lotteryStartDate = null
      this.lotteryEndDate = null
      if (startDateData) {
        this.lotteryStartDate = startDateData.date
      }
      if (endDateData) {
        this.lotteryEndDate = endDateData.date
      }

      this.halfCircleWidth = `${this.circleWidth} / 2`
      this.numOfPresenters = this.$store.state.ltSettings.numOfPresenters
    },
    initImplementationLTDate () {
      this.implementationLTDate = getDay(DAY.FRIDAY, 1)
    },
    /**
     * グラフ初期処理
     */
    initChartData () {
      this.chartData = {
        labels: [],
        datasets: [
          {
            data: [],
            borderWidth: 1,
            backgroundColor: []
          }
        ]
      }
    },
    /**
     * Firestoreのスナップショットの初期処理
     */
    async initOnSnapShots () {
      // LT実施履歴の変更を監視
      this.ltHistoryListner = await LTHistory.onSnapshots(async (snapshot) => {
        if (this.myOperation) {
          // 自分の操作による変更の場合反映しない
          this.myOperation = false
          return
        }
        if (snapshot.metadata.fromCache) {
          // キャッシュからの呼び出しは無視する
          return
        }

        if (this.ltHistoryListnerInitialized) {
          // 画面遷移後の初期設定が終わった後にしか反映しない

          await this.initAllLTHistory()
          await this.initUserDataList()
          this.initImplementationLTDate()
          this.initChartData()

          return
        }
        this.ltHistoryListnerInitialized = true
      })
      // ユーザー情報の変更を監視
      this.userListner = await User.onSnapshots(async (snapshot) => {
        if (snapshot.metadata.fromCache) {
          // キャッシュからの呼び出しは無視する
          return
        }

        if (this.userListnerInitialized) {
          if (this.hasNotification) {
            // 既に通知が出ている場合は出さない
            return
          }

          this.hasNotification = true
          // 画面遷移後の初期設定が終わった後にしか通知しない
          this.$toasted.show('ユーザー情報が更新されました', {
            theme: 'toasted-primary',
            position: 'top-right',
            type: 'info',
            action: {
              text: '更新する',
              onClick: async (e, toastObject) => {
                this.loadingDialog.open()

                toastObject.goAway(0)
                await this.initialize()

                this.loadingDialog.close()

                this.hasNotification = false
              }
            }
          })

          return
        }
        this.userListnerInitialized = true
      })
    },

    /**
     * 指定されたuidのユーザーを探す
     * @param {string} uid uid
     * @returns ユーザー
     */
    findUser (uid) {
      return this.allUserList.find((v) => v.uid === uid)
    },
    /**
     * 指定されたuidのユーザー名を取得する
     * @param {string} uid uid
     * @returns ユーザー名
     */
    findUserName (uid) {
      if (!uid || this.userDataList.length === 0) {
        // uidが空文字の場合やユーザーデータが存在しない場合は空文字を返す
        return ''
      }

      const user = this.findUser(uid)
      if (user) {
        return user.name
      }
      return '存在しないユーザーです'
    },
    /**
     * 全ユーザーのデータをリストで取得する
     * @returns 全ユーザーリスト
     */
    getUserListForSelect () {
      const userList = this.userDataList.map((x) => {
        return x.user
      })
      userList.unshift({
        uid: '',
        name: ''
      })

      return userList
    },

    /**
     * 抽選画面を開く
     */
    openLotteryDialog () {
      // スキップにチェックがついていないユーザーを抽出
      this.userDataListToDraw = this.userDataList.filter(x => !x.checked)
      const drawNum = this.userDataListToDraw.length

      this.maxNumOfPresenters = this.maxNumOfPresenters > drawNum ? drawNum : this.maxNumOfPresenters
      this.numOfPresenters = this.maxNumOfPresenters

      this.updateLotteryData(this.defaultScoreList)
      this.lotteryDialog = true
    },
    /**
     * 抽選画面を閉じる
     */
    closeLotteryDialog () {
      this.lotteryDialog = false
      this.initImplementationLTDate()
      this.initChartData()
    },
    /**
     * 抽選した次の発表者を保存する
     */
    async saveNextUsers () {
      this.closeResultScreen()

      // 指定された実施日時に該当する履歴を検索する
      var history = this.allLTHistory.filter((x) => {
        return isDate(x.date) && compareDate(x.date, this.implementationLTDate)
      })
      // 詳細を生成
      var details = []
      for (const target of this.targetList) {
        details.push({
          uid: target,
          contents: ''
        })
      }
      if (history.length === 0) {
        // 履歴がない場合は新規に作成する
        await this.addLTHistory({
          date: this.implementationLTDate,
          details: details
        })
      } else if (history.length === 1) {
        // 履歴が一件見つかった場合は更新する
        const item = history[0]
        // すでに実施者データがある場合は上書きするか確認する
        var alreadyValue = false
        for (var detail of item.details) {
          alreadyValue = detail.uid !== '' || detail.contents !== ''
          if (alreadyValue) {
            break
          }
        }
        if (alreadyValue) {
          // 上書き確認ダイアログを出す
          this.initOverwriteDialog(item, details)
          this.checkOverwriteDialog = true
          return
        }
        const data = {
          details: details
        }
        await this.updateLTHistory(item, data)
      }

      this.closeLotteryDialog()
    },
    /**
     * 結果画面を閉じる
     */
    closeResultScreen () {
      this.resultScreen = false
      this.lotteryTitle = TITLE_LOTTERY
      this.stillChoosing = false
    },
    /**
     * 上書き確認ダイアログを初期化する
     * @param {LTHistory} ltHistory LT実施履歴
     * @param {object} details 上書きするデータ
     */
    initOverwriteDialog (ltHistory, details) {
      // 上書き処理を設定
      this.overwriteLTHistory = async () => {
        const data = {
          details: details
        }
        await this.updateLTHistory(ltHistory, data)
        // 上書きが完了したらダイアログを全て閉じる
        this.closeOverwriteDialog()
        this.closeLotteryDialog()
      }
    },
    /**
     * 上書き確認ダイアログを閉じる
     */
    closeOverwriteDialog () {
      this.checkOverwriteDialog = false
      this.overwriteLTHistory = () => {}
    },

    /**
     * チャートのデータを更新する
     * @param {Array} scoreList スコアリスト
     */
    updateLotteryData (scoreList) {
      // chartDataを複製する
      const chartData = JSON.parse(JSON.stringify(this.chartData))

      // labelsにユーザー名リストを設定
      chartData.labels = scoreList.map((row) => this.findUserName(row.uid))
      // dataにscoreリストを設定
      chartData.datasets[0].data = scoreList.map((row) => row.score)
      chartData.datasets[0].backgroundColor = [...Array(scoreList.length).keys()].map((d) => {
        // scoreがMAX_SCORE以上の時は棒グラフの色を変える
        return scoreList[d].score >= MAX_SCORE ? TARGET_BAR_COLOR : NOMAL_BAR_COLOR
      })

      // チャートのデータを更新
      this.chartData = chartData
    },
    /**
     * 抽選中のスコアをグラフに描写する
     */
    async drawLots () {
      // データを初期化しておく
      this.initChartData()

      // 抽選中に設定する
      this.lotteryTitle = TITLE_CHOOSING
      this.stillChoosing = true
      // 抽選スコアを計算
      const scoreList = this.calculateScore(this.userDataListToDraw)

      for (let i = 0; i < scoreList.length; i++) {
        logger.debug(`name<uid>: ${this.findUserName(scoreList[i].uid)}<${scoreList[i].uid}>, score: ${scoreList[i].score}`)
      }

      // 当選者リスト
      var targetList = []
      // 計算スピード
      var speed = 0.7
      var nowScoreList = scoreList.concat()

      while (true) {
        for (let i = 0; i < scoreList.length; i++) {
          // 現在のスコア値を取得
          var nowValue = nowScoreList[i].score
          // 新しい値を計算
          var newValue = Math.min(MAX_SCORE, nowValue + Math.floor(Math.random() * (scoreList[i].score * speed)))
          // 保持
          nowScoreList[i].score = newValue

          // 現在値が100未満で新しい値がMAX_SCORE以上の場合は選出者と見なす
          if (nowValue < MAX_SCORE && newValue >= MAX_SCORE) {
            targetList.push(scoreList[i].uid)
            this.updateLotteryData(nowScoreList)
            if (targetList.length >= this.numOfPresenters) {
              // 選出者数分を選出したら終了する
              logger.debug(`targetList: ${printJson(targetList)}`)
              this.updateLotteryData(nowScoreList)

              this.targetList = targetList
              // 結果画面を表示
              this.resultScreen = true
              return
            }
          }

          this.updateLotteryData(nowScoreList)
          if (i % 3 === 0) {
            // 3人ずつ描写するよう1秒待機を入れる
            await sleep(1000)
          }
        }
      }
    },
    /**
     * スコアを計算する
     * @param {Array} ユーザーデータのリスト
     * @returns スコアリスト
     */
    calculateScore (userDataList) {
      var scoreList = []

      // スコアを計算する
      const today = new Date()
      // 最終実施日時から十分なインターバルが開いているか確認するための日時を算出
      var nextDate = new Date()
      nextDate.setDate(today.getDate() - NEXT_INTERVAL)

      // 実施回数で順位づけしてソートしたユーザーリスト
      const rankedUserDataList = addRankingAllowSameRank(userDataList, 'user.uid', 'numOfPresentations')

      // 最終実施日時の最小値を取得する
      var minLastDateData = null
      if (userDataList.length > 0) {
        minLastDateData = this.getMinDateData(userDataList, 'lastDate')
      }
      // timestampを取得
      // 実施した人が0人の場合は一ヶ月前を指定
      var minLastDate = nextDate
      if (minLastDateData != null) {
        minLastDate = minLastDateData.lastDate
      }

      for (let i = 0; i < this.userDataList.length; i++) {
        const userData = this.userDataList[i]
        scoreList[i] = {
          uid: userData.user.uid,
          score: 0
        }

        // 最終実施日時を取得
        const lastDate = userData.lastDate
        // 下記の場合スコア値を計算する
        // ・最終実施日時がDate型で、かつ十分なインターバルが開いている時
        // ・最終日時がDate型でない時
        if (!isDate(lastDate) || (isDate(lastDate) && lastDate <= nextDate)) {
          // 実施回数の順位を取得
          const index = rankedUserDataList.findIndex(x => x.user.uid === userData.user.uid)
          const rankingData = rankedUserDataList[index]
          if (rankingData === undefined) {
            // rankingデータがない（スキップするユーザー）場合はスコア計算しない
            continue
          }
          const rank_ = rankingData.ranking
          if (rank_ === -1) {
            // 存在しない場合はスコア計算しない
            continue
          }

          // スコア計算に使用するtimestampを算出
          var timestamp = 0
          if (isDate(lastDate)) {
            const interval = calculateDay(today, lastDate)
            var rate = 1
            if (interval < 40) {
              rate = 0.8
            } else if (interval > 80) {
              rate = 1.2
            }
            timestamp = Math.floor(interval / 3 * rate)
          } else {
            // 最終実施日時がDate型でない場合は未実施と見なす
            timestamp = Math.floor(calculateDay(today, minLastDate) / 3)
          }

          scoreList[i].score = rank_ + timestamp
        }
      }

      return scoreList
    },
    /**
     * 最古のDateを取得する
     * @param {Array} list Dateリスト
     * @param {String} key キー名
     * @returns 最古のDate
     */
    getMinDateData (list, key) {
      if (list.length === 0) {
        return null
      }
      return list.reduce((a, b) => {
        const aFlag = a === null || !isDate(a[key])
        const bFlag = b === null || !isDate(b[key])

        if (aFlag && bFlag) {
          return null
        } else if (aFlag) {
          return b
        } else if (bFlag) {
          return a
        } else {
          return a[key] < b[key] ? a : b
        }
      })
    },
    /**
     * 最近のDateを取得する
     * @param {Array} list Dateリスト
     * @param {String} key キー名
     * @returns 最近のDate
     */
    getMaxDateData (list, key) {
      if (list.length === 0) {
        return null
      }
      return list.reduce((a, b) => {
        const aFlag = a === null || !isDate(a[key])
        const bFlag = b === null || !isDate(b[key])

        if (aFlag && bFlag) {
          return null
        } else if (aFlag) {
          return b
        } else if (bFlag) {
          return a
        } else {
          return a[key] > b[key] ? a : b
        }
      })
    },

    /**
     * LT履歴を保存する
     * @param {LTHistory} ltHistory LT履歴
     */
    async saveLTHistory (ltHistory) {
      const data = {
        date: ltHistory.date,
        index: ltHistory.index,
        details: ltHistory.details,
        editing: ltHistory.editing
      }

      await this.updateLTHistory(ltHistory, data)
    },

    /**
     * LT履歴が他のユーザーによって編集中かどうかを返す
     * @param {object} uidEditing 編集中のユーザーのuid
     * @returns LT履歴が他のユーザーによって編集中かどうか
     */
    isDisabledEditDialog (uidEditing) {
      if (uidEditing === null) {
        return false
      }

      return uidEditing !== this.$store.state.user.uid
    },
    /**
     * LT履歴編集ダイアログの操作状況を更新する
     * @param {LTHistory} ltHistory LT履歴
     * @param {object} editing 編集状況データ
     */
    async operateEditDialog (ltHistory, editing) {
      this.myOperation = true
      var data = this.createEditingData(ltHistory, editing)

      await ltHistory.update(data)
    },
    /**
     * LT履歴編集ダイアログの操作状況を更新する
     * @param {LTHistory} ltHistory LT履歴
     * @param {number} index LT履歴リストのindex
     * @param {string} key 編集中のフィールド名
     * @param {*} value 更新する値
     */
    async operateDetailsEditDialog (ltHistory, index, key, value) {
      var details = ltHistory.editing.details.concat()
      details[index][key] = value
      await this.operateEditDialog(ltHistory, {
        details: details
      })
    },
    /**
     * 編集状況データからLTHistory更新用データを作成する
     * @param {LTHistory} ltHistory LT履歴
     * @param {object} editing 編集状況データ
     * @returns 編集状況データ
     */
    createEditingData (ltHistory, editing) {
      var data = JSON.parse(JSON.stringify(ltHistory.editing))
      if (data) {
        Object.assign(data, editing)
        data = {
          editing: {
            ...data
          }
        }
      } else {
        data = {
          editing: {
            ...editing
          }
        }
      }
      return data
    },

    /**
     * 右クリックメニューを開く
     */
    openMenu (event, item) {
      this.selectLTHistory = item.item
      this.$refs.ctxMenu.open()
    },

    /**
     * LT履歴を追加する
     */
    async addLTHistory ({index = null, date = null, details = []}) {
      this.loadingDialog.open()
      this.loading = true

      const editing = {
        date: null,
        details: []
      }

      await LTHistory.create(index, date, details, editing)

      // リロード
      await this.initialize()
      this.initChartOptions()

      this.loading = false
      this.loadingDialog.close()
    },
    /**
     * 選択したLT履歴の上に追加する
     */
    async insertOnLTHistory () {
      const index = this.selectLTHistory.index
      await this.addLTHistory({index: index})
    },
    /**
     * 選択したLT履歴の下に追加する
     */
    async insertBelowLTHistory () {
      const index = this.selectLTHistory.index + 1
      await this.addLTHistory({index: index})
    },
    /**
     * LT履歴を更新する
     */
    async updateLTHistory (item, data) {
      this.loadingDialog.open()
      this.loading = true

      await item.update(data)

      // リロード
      await this.initialize()
      this.initChartOptions()

      this.loading = false
      this.loadingDialog.close()
    },
    /**
     * LT履歴を削除する
     */
    async deleteLTHistory () {
      this.loadingDialog.open()
      this.loading = true

      // 履歴を削除する
      await this.selectLTHistory.delete()
      // リロード
      await this.initialize()
      this.initChartOptions()

      this.loading = false
      this.loadingDialog.close()
    }
  },

  beforeDestroy () {
    // 監視用リスナーを破棄
    this.ltHistoryListner()
    this.userListner()
    // 通知をクリア
    this.$toasted.clear()
  }
}
</script>

<style scoped>
  .lotteryButton {
    padding-left: 10px;
  }

  .contents {
    padding: 20px auto;
  }
  .tableContainerWrapper {
    overflow-x: auto;
  }
  .tableContainer {
    display: flex;
    margin: 20px auto 0;
    width: 1450px;
    justify-content: center;
  }

  table {
    border-spacing: 1;
    font-size: 14px;
    height: 40px;
  }

  .implementationHistory {
    margin-left: 50px;
    width: 1022px;
    min-height: 132px;
    border: 1px solid rgb(197, 197, 197);
  }

  .implementationsData {
    width: 500px;
    margin-left: 50px;
    margin-right: 50px;
  }
  .numberOfImplementations {
    width: 360px;
  }

  .numOfPresenters {
    margin-top: -10px;
  }
  .numOfPresentersLabel {
    font-size: 12px;
  }

  th, td {
    padding: 10px 0;
    text-align: center;
    word-break : break-all;
  }

  .cell {
    background: rgba(255, 206, 47, 0.555);
    font-weight: bold;
  }

  th {
    background: rgba(255, 206, 47, 0.555);
    height: 40px;
  }

  .dateCell {
    width: 100px;
  }
  .nameCell {
    width: 150px;
  }
  .contentCell {
    width: 300px;
  }
  .skipCell {
    width: 70px;
  }
  .countCell {
    width: 40px;
  }

  tr:nth-child(odd) {
    background-color: rgba(255, 240, 227, 0.918);
  }

  .lotteryOptions {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .resultTitle {
    width: 560px;
    background: white;
    z-index: 10;
  }
  .resultBorder {
    position: absolute;
    background: white;
    z-index: 8;
  }
  .borderTop {
    top: 0px;
    left: 0px;
    width: 560px;
    height: 70px;
  }
  .borderLeft {
    top: 0px;
    left: 0px;
    width: 30px;
    height: 400px;
  }
  .borderRight {
    top: 0px;
    right: 0px;
    width: 30px;
    height: 400px;
  }
  .borderBottom {
    bottom: 0px;
    left: 0px;
    width: 560px;
    height: 50px;
  }

  .resultScreen {
    background-color: white;
    position: absolute;
    top: calc(50% + 10px);
    left: 50%;
    padding: 5px;
    -webkit-transform : translate(-50%,-50%);
    transform : translate(-50%,-50%);
  }
  .targetName {
    font-weight: bold;
    padding: 6px;
    text-align: center;
  }

  .resultButtons {
    position: absolute;
    bottom: 8px;
    right: 12px;
    z-index: 10;
  }

  .lineContainer {
    position: absolute;

    --border-color: #ffab3c;

    width: var(--circle-width);
    height: var(--circle-width);
    left: calc(50% - var(--half-circle-width));
    top: calc(50% - var(--half-circle-width));

    /* ランダムな太さの線を重ねる */
    background-image: repeating-conic-gradient(
      transparent 0,
      transparent 13deg,
      var(--border-color) 13deg,
      var(--border-color) 16deg
    ),
    repeating-conic-gradient(
      transparent 0,
      transparent 20deg,
      var(--border-color) 20deg,
      var(--border-color) 23deg
    ),
    repeating-conic-gradient(
      transparent 0,
      transparent 5deg,
      var(--border-color) 5deg,
      var(--border-color) 8deg
    ),
    repeating-conic-gradient(
      transparent 0,
      transparent 2deg,
      var(--border-color) 2deg,
      var(--border-color) 3deg
    );
    -webkit-animation: backgroundAnimation 20s infinite linear;
    animation: backgroundAnimation 20s infinite linear;
  }

  @-webkit-keyframes backgroundAnimation {
    from {
      -webkit-transform: rotate(0);
      transform: rotate(0);
    }
    to {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }

  @keyframes backgroundAnimation {
    from {
      -webkit-transform: rotate(0);
      transform: rotate(0);
    }
    to {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
</style>

import streamlit as st
import pandas as pd
from datetime import timedelta

st.set_page_config(page_title="Facility Tasks Dashboard", layout="wide")

# Load and preprocess data
@st.cache_data
def load_data():
    df = pd.read_csv("facility_tasks.csv", parse_dates=['scheduled_time', 'start_time', 'completion_time'])
    df['DATE'] = df['scheduled_time'].dt.date
    df['was_missed'] = df['was_missed'].astype(int)
    df['actual_duration'] = df['actual_duration'].fillna(0)
    df['feedback_score'] = df['feedback_score'].fillna(df['feedback_score'].mean())
    return df

df = load_data()

# Sidebar filters
with st.sidebar:
    st.header("⚙️ Filters")
    start_date = st.date_input("Start Date", df['DATE'].min())
    end_date = st.date_input("End Date", df['DATE'].max())
    team_filter = st.multiselect("Assigned Team", df['assigned_to'].unique(), default=df['assigned_to'].unique())
    task_type_filter = st.multiselect("Task Type", df['task_type'].unique(), default=df['task_type'].unique())

# Apply filters
filtered_df = df[
    (df['DATE'] >= start_date) &
    (df['DATE'] <= end_date) &
    (df['assigned_to'].isin(team_filter)) &
    (df['task_type'].isin(task_type_filter))
]

# Aggregate metrics
total_tasks = len(filtered_df)
missed_tasks = filtered_df['was_missed'].sum()
total_actual_hours = filtered_df['actual_duration'].sum() / 60  # in hours
avg_feedback_score = filtered_df['feedback_score'].mean()

# Display Metrics
st.title("🚀 Facility Task Management Dashboard")

cols = st.columns(4)
cols[0].metric("🗂️ Total Tasks", f"{total_tasks}")
cols[1].metric("❌ Missed Tasks", f"{missed_tasks}")
cols[2].metric("⏳ Actual Work Hours", f"{total_actual_hours:.2f} hrs")
cols[3].metric("⭐ Avg. Feedback", f"{avg_feedback_score:.2f}/5")

# Task Completion Overview
st.subheader("📈 Tasks Missed Over Time")
missed_over_time = filtered_df.groupby('DATE')['was_missed'].sum().reset_index()
st.bar_chart(missed_over_time.set_index('DATE'))

# Feedback Score Trend
st.subheader("🌟 Feedback Score Trend")
feedback_trend = filtered_df.groupby('DATE')['feedback_score'].mean().reset_index()
st.line_chart(feedback_trend.set_index('DATE'))

# Technician-wise performance
st.subheader("👨‍🔧 Technician Performance")
tech_perf = filtered_df.groupby('assigned_to').agg({
    'was_missed': 'sum',
    'feedback_score': 'mean',
    'task_id': 'count'
}).rename(columns={'was_missed':'Missed', 'feedback_score':'Avg Feedback', 'task_id':'Total Tasks'})
st.dataframe(tech_perf.sort_values(by='Missed', ascending=False))

# Location-wise Analysis
st.subheader("📍 Location Analysis")
loc_analysis = filtered_df.groupby('location')['was_missed'].sum().sort_values(ascending=False)
st.bar_chart(loc_analysis)

# Asset Type Analysis
st.subheader("🛠️ Asset Type Performance")
asset_perf = filtered_df.groupby('asset_type')['was_missed'].sum().sort_values(ascending=False)
st.bar_chart(asset_perf)

# Detailed Table
st.subheader("🔍 Detailed Task Data")
st.dataframe(filtered_df[['task_id','task_type','assigned_to','location','priority','DATE','was_missed','actual_duration','feedback_score']])
